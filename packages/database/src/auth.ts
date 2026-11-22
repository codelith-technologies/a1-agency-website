import { createSupabaseBrowserClient } from "./client";

export type StaffRole = "owner" | "administrator" | "recruiter" | "content_editor";
export type StaffSession = {
  userId: string;
  email: string;
  role: StaffRole;
  displayName: string | null;
};
type StaffResult = { session: StaffSession; error: null } | { session: null; error: string };
type Client = NonNullable<ReturnType<typeof createSupabaseBrowserClient>>;
const connectionError = "Unable to connect to authentication services. Please try again.";

function isConnectionError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const value = error as { name?: string; message?: string; status?: number };
  return value.name === "AuthRetryableFetchError" || value.status === 0
    || (typeof value.status === "number" && value.status >= 500)
    || /failed to fetch|fetch failed|network|load failed|timeout|timed out/i.test(value.message ?? "");
}

function isStaffRole(role: unknown): role is StaffRole {
  return role === "owner" || role === "administrator" || role === "recruiter" || role === "content_editor";
}

async function clearSession(client: Client): Promise<void> {
  try {
    // Supabase 2.119.2 clears local state and emits SIGNED_OUT before remote
    // revocation, including when that network request fails.
    await client.auth.signOut({ scope: "local" });
  } finally {
    clearStaffSessionMarker();
  }
}

async function clearInvalidSession(client: Client): Promise<void> {
  await clearSession(client).catch(() => undefined);
}

async function verifyStaff(client: Client, user: { id: string; email?: string }): Promise<StaffResult> {
  const { data: profile, error } = await client.from("staff_profiles")
    .select("user_id,role,display_name,active")
    .eq("user_id", user.id).eq("active", true).maybeSingle();
  if (error) return { session: null, error: isConnectionError(error) ? connectionError : "Could not verify staff access." };
  if (!profile || !user.id || profile.user_id !== user.id || profile.active !== true || !isStaffRole(profile.role)) {
    return { session: null, error: "This account is not an active staff account." };
  }
  return { session: { userId: user.id, email: user.email ?? "", role: profile.role,
    displayName: typeof profile.display_name === "string" ? profile.display_name : null }, error: null };
}

export async function signInStaff(email: string, password: string): Promise<StaffResult> {
  let client: Client | null = null;
  let verified = false;
  try {
    client = createSupabaseBrowserClient();
    if (!client) return { session: null, error: "Supabase is not configured." };
    const normalizedEmail = email.trim().toLowerCase();
    const { data, error } = await client.auth.signInWithPassword({ email: normalizedEmail, password });
    if (error) return { session: null, error: isConnectionError(error) ? connectionError
      : error.code === "invalid_credentials" ? "Invalid email or password." : "Authentication failed. Please try again." };
    if (!data.user) return { session: null, error: "Authentication failed." };
    const result = await verifyStaff(client, { id: data.user.id, email: data.user.email ?? normalizedEmail });
    verified = result.session !== null;
    return result;
  } catch (error) {
    return { session: null, error: isConnectionError(error) ? connectionError : "Could not verify staff access." };
  } finally {
    if (!verified) {
      clearStaffSessionMarker();
      if (client) await clearSession(client).catch(() => undefined);
    }
  }
}

export async function getStaffSession(): Promise<StaffResult> {
  let client: Client | null = null;
  let verified = false;
  try {
    client = createSupabaseBrowserClient();
    if (!client) return { session: null, error: "Supabase is not configured." };
    // Validate with Auth; stored session metadata is never authorization.
    const { data, error } = await client.auth.getUser();
    if (error || !data.user) {
      if (!isConnectionError(error)) await clearInvalidSession(client);
      return { session: null, error: isConnectionError(error) ? connectionError : "Please sign in." };
    }
    const result = await verifyStaff(client, data.user);
    verified = result.session !== null;
    if (!verified && result.error !== connectionError) await clearInvalidSession(client);
    return result;
  } catch (error) {
    return { session: null, error: isConnectionError(error) ? connectionError : "Could not verify staff access." };
  } finally {
    if (!verified) clearStaffSessionMarker();
  }
}

export async function signOutStaff(): Promise<void> {
  try {
    const client = createSupabaseBrowserClient();
    if (client) await clearSession(client);
  } finally {
    clearStaffSessionMarker();
  }
}

/** Navigation hint only; never evidence of authentication or authorization. */
export function setStaffSessionMarker(): void {
  if (typeof document !== "undefined") document.cookie = "a1-admin-session=1; Path=/; Max-Age=28800; SameSite=Lax";
}

export function clearStaffSessionMarker(): void {
  if (typeof document !== "undefined") document.cookie = "a1-admin-session=; Path=/; Max-Age=0; SameSite=Lax";
}
