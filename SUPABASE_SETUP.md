# Supabase foundation

Phase 27 adds the database and storage foundation only. The existing public and
admin applications continue to use their demo datasets and static-export
configuration.

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

Install and authenticate the Supabase CLI locally, or link a local project:

```powershell
npx supabase login
npx supabase link --project-ref your-project-ref
npx supabase db push
npx supabase db reset
```

`db push` applies `supabase/migrations/` without destructive reset behavior.
Use `db reset` only against a disposable local/development database. The seed
is repeatable and all jobs remain `draft`; it does not create users or
credentials.

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
           'administrator',
           'Development Administrator',
           true);
   ```

   Replace the UUID and role as needed. The accepted roles are `owner`,
   `administrator`, `recruiter`, and `content_editor`.
4. Open `http://localhost:3001/login`, sign in with the Supabase Auth email and
   password, and verify `/dashboard` loads.

The repository does not store staff passwords or identity secrets. Supabase
Auth passwords and staff-role values must be managed by an authorized project
owner.

## Hosting and remaining work

GitHub Pages cannot run Next.js server actions, API handlers, middleware
authentication, or private signed-download operations. Jobs created after a
static deployment cannot automatically produce new `/jobs/[slug]` pages
without a rebuild or a server-capable routing architecture. Phase 28 should
add real Supabase Auth and server-side workflows before connecting forms,
uploads, or admin CRUD. Production deployment, email, payments, analytics, and
live submissions remain out of scope for Phase 27.
