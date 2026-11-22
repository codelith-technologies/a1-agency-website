import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
import { createClient } from '@supabase/supabase-js';

test('installed SDK staff verification does not re-emit auth events or loop', async () => {
  const key = 'phase28-verification-session';
  const user = { id: 'staff-1', email: 'staff@example.test' };
  const storage = new Map([[key, JSON.stringify({
    access_token: 'test-token', refresh_token: 'test-refresh',
    expires_at: Math.floor(Date.now() / 1000) + 3600, token_type: 'bearer', user,
  })]]);
  const requests = [];
  const client = createClient('https://example.supabase.co', 'test-key', {
    auth: {
      storageKey: key, autoRefreshToken: false, detectSessionInUrl: false,
      storage: {
        getItem: (k) => storage.get(k) ?? null,
        setItem: (k, v) => { storage.set(k, v); },
        removeItem: (k) => { storage.delete(k); },
      },
    },
    global: { fetch: async (input) => {
      const url = new URL(String(input));
      requests.push(url.pathname);
      const body = url.pathname === '/auth/v1/user' ? user : {
        user_id: user.id, active: true, role: 'owner', display_name: 'Staff',
      };
      assert.ok(['/auth/v1/user', '/rest/v1/staff_profiles'].includes(url.pathname));
      return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } },
  });
  const events = [];
  let initialized;
  const initialEvent = new Promise((resolve) => { initialized = resolve; });
  const { data: { subscription } } = client.auth.onAuthStateChange((event) => {
    events.push(event);
    if (event === 'INITIAL_SESSION') initialized();
  });
  try {
    await initialEvent;
    const initialCount = events.length;
    const api = load('auth', { './client': { createSupabaseBrowserClient: () => client } });
    for (let i = 0; i < 3; i++) {
      assert.equal((await api.getStaffSession()).session.role, 'owner');
    }
    assert.equal(events.length, initialCount, 'verification must not retrigger the auth subscriber');
    assert.equal(requests.filter((path) => path === '/auth/v1/user').length, 3);
    assert.equal(requests.filter((path) => path === '/rest/v1/staff_profiles').length, 3);
  } finally {
    subscription.unsubscribe();
  }
});

// Execute actual source without writing build artifacts or adding dependencies.
function load(name, dependencies, globals = {}) {
  const source = readFileSync(new URL('../src/' + name + '.ts', import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
  const exports = {};
  vm.runInNewContext(outputText, { exports, require: (id) => dependencies[id], ...globals });
  return exports;
}
function fixture(options = {}) {
  const user = { id: 'staff-1', email: 'staff@example.test' };
  const state = { signOuts: [], credentials: null, filters: [] };
  const document = { cookie: 'a1-admin-session=1' };
  const authenticate = async () => {
    if (options.authThrow) throw options.authThrow;
    return { data: { user: options.noUser ? null : user }, error: options.authError ?? null };
  };
  const client = {
    auth: {
      signInWithPassword: async (credentials) => { state.credentials = credentials; return authenticate(); },
      getUser: authenticate,
      signOut: async (value) => {
        state.signOuts.push(value);
        if (options.logoutThrow) throw new Error('subscriber failure');
        return { error: options.logoutError ?? null };
      },
    },
    from: (table) => {
      assert.equal(table, 'staff_profiles');
      const query = {
        select: () => query,
        eq: (key, value) => { state.filters.push([key, value]); return query; },
        maybeSingle: async () => {
          if (options.profileThrow) throw options.profileThrow;
          return { data: options.noProfile ? null : { user_id: user.id, active: true, role: 'owner', display_name: 'Staff', ...options.profile }, error: options.profileError ?? null };
        },
      };
      return query;
    },
  };
  const api = load('auth', { './client': { createSupabaseBrowserClient: () => {
    if (options.configThrow) throw new Error('invalid config');
    return options.unconfigured ? null : client;
  } } }, { document });
  return { api, state, document };
}
for (const role of ['owner', 'administrator', 'recruiter', 'content_editor']) {
  test('verified login and restoration: ' + role, async () => {
    const { api, state } = fixture({ profile: { role } });
    assert.equal((await api.signInStaff(' STAFF@Example.test ', ' keep spaces ')).session.role, role);
    assert.equal(state.credentials.email, 'staff@example.test');
    assert.equal(state.credentials.password, ' keep spaces ');
    assert.equal((await api.getStaffSession()).session.role, role);
    assert.equal(state.signOuts.length, 0);
    assert.ok(state.filters.some(([key, value]) => key === 'user_id' && value === 'staff-1'));
  });
}
for (const [name, options] of Object.entries({
  missingProfile: { noProfile: true }, inactive: { profile: { active: false } },
  malformedActive: { profile: { active: 'true' } }, wrongId: { profile: { user_id: 'other' } },
  unknownRole: { profile: { role: 'superuser' } }, missingRole: { profile: { role: null } },
  queryError: { profileError: { message: 'permission denied' } },
  queryNetwork: { profileError: { message: 'TypeError: Failed to fetch' } },
  queryThrow: { profileThrow: new Error('unexpected') },
  noUser: { noUser: true }, authThrow: { authThrow: new TypeError('fetch failed') },
  wrongPassword: { authError: { code: 'invalid_credentials' } },
  cleanupThrow: { noProfile: true, logoutThrow: true },
  cleanupError: { noProfile: true, logoutError: { status: 503 } },
})) {
  test('reject login, clean local state, fail closed on restoration: ' + name, async () => {
    const { api, state, document } = fixture(options);
    const result = await api.signInStaff('staff@example.test', 'password');
    assert.equal(result.session, null);
    assert.equal(typeof result.error, 'string');
    assert.equal(state.signOuts.length, 1);
    assert.equal(state.signOuts[0].scope, 'local');
    assert.match(document.cookie, /Max-Age=0/);
    assert.equal((await api.getStaffSession()).session, null);
  });
}
test('network failures differ from invalid credentials', async () => {
  const offline = await fixture({ authError: { name: 'AuthRetryableFetchError', status: 0 } }).api.signInStaff('x', 'y');
  const invalid = await fixture({ authError: { code: 'invalid_credentials' } }).api.signInStaff('x', 'y');
  assert.match(offline.error, /connect/);
  assert.equal(invalid.error, 'Invalid email or password.');
});
test('invalid restored staff sessions are cleared locally', async () => {
  const { api, state, document } = fixture({ noProfile: true });
  const result = await api.getStaffSession();
  assert.equal(result.session, null);
  assert.equal(state.signOuts.length, 1);
  assert.equal(state.signOuts[0].scope, 'local');
  assert.match(document.cookie, /Max-Age=0/);
});
test('connection failures preserve the session for retry', async () => {
  const { api, state } = fixture({ profileError: { message: 'Failed to fetch' } });
  const result = await api.getStaffSession();
  assert.equal(result.session, null);
  assert.match(result.error, /connect/);
  assert.equal(state.signOuts.length, 0);
});
for (const options of [{}, { logoutError: { status: 503 } }, { logoutThrow: true }, { configThrow: true }, { unconfigured: true }]) {
  test('logout clears marker: ' + JSON.stringify(options), async () => {
    const { api, document } = fixture(options);
    await api.signOutStaff().catch(() => {});
    assert.match(document.cookie, /Max-Age=0/);
  });
}
test('lazy browser singleton; isolated server clients; optional missing config', () => {
  let count = 0;
  const dependencies = { '@supabase/supabase-js': { createClient: () => ({ instance: ++count }) } };
  const env = {};
  const browser = load('client', dependencies, { window: {}, process: { env } });
  assert.equal(browser.createSupabaseBrowserClient(), null);
  assert.throws(() => browser.createRequiredSupabaseBrowserClient(), /not configured/);
  env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
  assert.throws(() => browser.createSupabaseBrowserClient(), /Both/);
  env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'test-key';
  assert.equal(browser.createSupabaseBrowserClient(), browser.createRequiredSupabaseBrowserClient());
  assert.equal(count, 1);
  const server = load('client', dependencies, { process: { env } });
  assert.notEqual(server.createSupabaseBrowserClient(), server.createSupabaseBrowserClient());
});
test('installed SDK local logout clears storage and emits SIGNED_OUT despite server failure', async () => {
  const key = 'phase28-test-session';
  const storage = new Map([[key, JSON.stringify({ access_token: 'test-token', refresh_token: 'test-refresh', expires_at: Math.floor(Date.now() / 1000) + 3600, token_type: 'bearer', user: { id: 'staff-1' } })]]);
  const client = createClient('https://example.supabase.co', 'test-key', {
    auth: { storageKey: key, storage: { getItem: (k) => storage.get(k) ?? null, setItem: (k, v) => { storage.set(k, v); }, removeItem: (k) => { storage.delete(k); } }, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: async () => new Response(JSON.stringify({ message: 'unavailable' }), { status: 503, headers: { 'Content-Type': 'application/json' } }) },
  });
  const events = [];
  const { data: { subscription } } = client.auth.onAuthStateChange((event) => { events.push(event); });
  const result = await client.auth.signOut({ scope: 'local' });
  assert.ok(result.error);
  assert.equal(storage.has(key), false);
  assert.equal((await client.auth.getSession()).data.session, null);
  assert.ok(events.includes('SIGNED_OUT'));
  subscription.unsubscribe();
});
