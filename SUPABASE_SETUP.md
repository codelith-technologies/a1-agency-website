# Supabase foundation

Phase 27 added the database and storage foundation. Phase 28 hardens staff
authentication, session handling, recovery, role-aware navigation, and RLS.
Both applications retain static export. Existing public-read/demo/error behavior
is preserved; full admin CRUD is not implemented.

## Create and configure a project

1. Create a Supabase project for development. Do not use production credentials
   for local testing.
2. Copy the project URL and publishable key from **Project Settings > API** into
   `apps/web/.env.local` and `apps/admin/.env.local`:

   ```text
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   ```

   The publishable key is browser-safe only because database and storage access
   is controlled by RLS. Never place a service-role key in either application.
3. Keep `.env.local` files untracked. `.env.example` files contain placeholders
   only.

## Apply migrations and seed development data

For a hosted **development** project, authenticate and link the intended project.
Replace the project-ref placeholder with its dashboard project ID, then review
the pending changes before applying them:

```powershell
npx supabase login
npx supabase link --project-ref your-project-ref
npx supabase db push --dry-run
npx supabase db push
```

`db push` applies `supabase/migrations/` without resetting the database. It does
not seed hosted projects by default. Never reset the hosted database as a setup
step. For a **separate disposable local instance**, Docker and a local Supabase
configuration are required; initialize once (`npx supabase init`), start it
(`npx supabase start`), then use `npx supabase db reset --local` only when replacing
all of its local data is intentional. The seed contains fictional draft jobs;
it does not create users or credentials.

The migration creates `public-media` and `recruitment-documents` as private
staff-controlled storage areas. Public delivery must use an explicitly approved
server or CDN workflow with signed URLs. File size is limited to 5 MB.
Public media permits JPEG, PNG, and WebP; recruitment documents permit PDF,
DOC, and DOCX. SVG uploads are disabled.

## Schema and access model

- `countries`, `job_categories`, and `jobs` hold normalized recruitment
  content. Jobs reference both country and category and use structured salary,
  age, vacancy, publication, and closing-date fields.
- `applicants`, `job_applications`, and `application_status_history` separate
  candidate identity, applications, and workflow history. Internal notes and
  documents are never public.
- `employer_requests` and `contact_messages` are staff-only.
- `reviews`, `events`, `announcements`, `faqs`, `team_members`, and
  `media_assets` expose only explicitly published content.
- `staff_profiles` maps `auth.users.id` to trusted roles:
  `owner`, `administrator`, `recruiter`, and `content_editor`.
- `audit_logs` is staff-only and has no anonymous insert policy.

Anonymous users can read only published content. There are deliberately no
anonymous insert policies for applications, contact messages, employer
requests, or content. Future submissions must be implemented through a
validated server-capable workflow with abuse protection.

`public.job_accepts_applications(job_row)` checks publication status and the
closing date. A future application endpoint must call this check server-side;
frontend deadline checks are not an authorization boundary.

## Generate TypeScript types

After applying migrations, generate canonical database types from the linked
project:

```powershell
npx supabase gen types typescript --linked --schema public > packages/database/src/database.types.ts
```

Keep generated row types separate from the existing presentation models in
`packages/types`. Regenerate after schema changes instead of manually
maintaining a second database schema definition.

## Connection and security checks

The client factory is exported from `@a1/database` and returns `null` when
configuration is absent, so static GitHub Pages builds remain usable. Use
`createRequiredSupabaseBrowserClient()` only from a configured, supported
runtime; it throws explicitly when configuration is incomplete.

Before any integration is enabled, verify with fictional data that anonymous
reads return published rows only, draft jobs and all applicant/application
rows are denied, anonymous inserts and private-bucket reads are denied, and a
staff user can perform only its permitted work.

## Create an authenticated staff account

Staff accounts are not created by the seed process. In Supabase:

1. Open **Authentication > Users** and create a user with a strong generated
   password.
2. Copy the created user's UUID.
3. Add their trusted database role without entering it in browser metadata:

   ```sql
   insert into public.staff_profiles (user_id, role, display_name, active)
   values ('00000000-0000-4000-8000-000000000000',
           'owner',
           'Development Owner',
           true);
   ```

   Replace the example UUID with the newly created Auth UUID locally; do not
   commit real identifiers or passwords. Bootstrap the first development account
   as `owner`. Further accounts can be `administrator`, `recruiter`, or
   `content_editor`. Only an active owner can manage staff profiles through RLS;
   administrators cannot assign roles or promote themselves. Ordinary active
   staff can read their own profile, not other staff profiles.
4. Open `http://localhost:3001/login`, sign in with the Supabase Auth email and
   password, and verify `/dashboard` loads.

The repository does not store staff passwords or identity secrets. Supabase
Auth passwords and staff-role values must be managed by an authorized project
owner.

## Password recovery

The static `/reset-password` route requests Supabase recovery email and handles
`PASSWORD_RECOVERY` before allowing an active, verified staff member to update
their password. It signs out after a successful update; recovery never grants a
staff role. A reloaded or expired recovery screen may require a fresh email link.

Configure the development and deployed Site URL and exact redirect allowlist in
Supabase Auth. Include `http://localhost:3001/reset-password` for local testing
and the actual HTTPS deployment URL including its admin base path, for example
`https://YOUR-ORGANIZATION.github.io/a1-agency-website/admin/reset-password`.
Configure an approved email sender/SMTP provider, appropriate rate limits, and
disable public signups in the Supabase project if accounts are staff-only.
Do not use wildcard production redirect URLs. Test expired/reused links and
email delivery before enabling recovery for staff. No email was sent as part of
implementation verification.

See [Supabase password recovery](https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail)
and [auth-state events](https://supabase.com/docs/reference/javascript/auth-onauthstatechange).

## Hosting and remaining work

GitHub Pages cannot run Next.js server actions, API handlers, middleware
authentication, or private signed-download operations. Jobs created after a
static deployment cannot automatically produce new `/jobs/[slug]` pages
without a rebuild or a server-capable routing architecture. Static assets and
RSC payloads are public, regardless of the client-side gate: never embed private
records in Server Components/build output. The obsolete marker-cookie middleware
and disabled login/logout API stubs were removed; `a1-admin-session` is not used
for authorization. Browser Supabase Auth validates identity and RLS enforces
data access. The UI rechecks on navigation, Auth events, focus, and every minute
while visible. RLS checks active staff status on each database request.

Server-enforced route access, HttpOnly server sessions, trusted submission
endpoints, public-media delivery, and privileged staff provisioning APIs require
server-capable hosting. No provider migration is included. Browser logout cannot
revoke an already-issued access token instantly; it remains valid until expiry.
Deactivating the staff profile denies protected RLS operations immediately.
Already-downloaded data cannot be recalled. Use HTTPS and an appropriately short
JWT lifetime, and consider MFA and CSP before production.

See [Phase 28 permissions](./PHASE28_PERMISSIONS.md) and the
[Phase 28 verification report](./PHASE28_REPORT.md) for evidence and pending tests.
