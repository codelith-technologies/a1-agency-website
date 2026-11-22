# Phase 28 database permissions

This matrix describes browser clients after applying [the new migration](supabase/migrations/20261122000100_phase28_authorization.sql), together with the three unchanged Phase 27 migrations. No remote changes were performed.

`CRUD` means SELECT, INSERT, UPDATE and DELETE. `R` means SELECT only. `P` means only the public rows described below. `—` means no access. All privileged permissions require an active trusted staff profile matching `auth.uid()`; browser metadata is never authoritative. Owner access still respects constraints and foreign keys.

| Table | Owner | Administrator | Recruiter | Content editor | Anonymous / no profile / inactive |
| --- | --- | --- | --- | --- | --- |
| countries | CRUD | CRUD | P | CRUD | P |
| job_categories | CRUD | CRUD | P | CRUD | P |
| jobs | CRUD | CRUD | CRUD | P | P |
| applicants | CRUD | CRUD | CRUD | — | — |
| job_applications | CRUD | CRUD | CRUD | — | — |
| application_status_history | CRUD | CRUD | CRUD | — | — |
| employer_requests | CRUD | CRUD | CRUD | — | — |
| contact_messages | CRUD | CRUD | CRUD | — | — |
| reviews | CRUD | CRUD | P | CRUD | P |
| events | CRUD | CRUD | P | CRUD | P |
| announcements | CRUD | CRUD | P | CRUD | P |
| media_assets: public-media | CRUD | CRUD | P | CRUD | P |
| media_assets: recruitment-documents | CRUD | CRUD | CRUD | — | — |
| faqs | CRUD | CRUD | P | CRUD | P |
| team_members | CRUD | CRUD | P | CRUD | P |
| staff_profiles | CRUD | R own | R own | R own | R own if authenticated |
| audit_logs | R | R | — | — | — |

Self-profile reads include inactive profiles for sign-in verification. A user without a profile gets no profile rows; anonymous visitors cannot read profiles. Only active owners can list other profiles or create, update or delete profiles, including role/active changes. Auth-user provisioning remains a separate privileged operation; profile permission does not grant Supabase Auth administration.

Public rows: countries with `active`; categories with `is_published`; jobs with `status = 'published'` and `published_at <= now()`; verified published reviews; published events, FAQs and team members; published announcements with `published_at <= now()`; published media metadata in `public-media`. Public visibility remains available to inactive and other authenticated users. Public SELECT exposes the full matching row, not a column-filtered view. Job closing dates do not affect existing public visibility.

## Exact UI permission groups

- Recruitment: owner, administrator, recruiter. Jobs, applicants, applications, status history, employer requests, contact messages and recruitment-document metadata/objects.
- Content: owner, administrator, content_editor. Countries, categories, reviews, events, announcements, FAQs, team members and public-media metadata/objects.
- Staff management: owner only. Other users may read their own profile only.
- Audit viewing: owner, administrator. No browser role may create, update or delete audit records.

The UI route matcher normalizes GitHub Pages base paths (`/admin`, `/a1-agency-website/admin`, and the configured `NEXT_PUBLIC_BASE_PATH`) before applying route permissions. Known route prefixes include nested create/edit/detail paths by matching a route boundary (for example, `/jobs/new` and `/jobs/<id>`). Owner is granted every legitimate recruitment, content, staff-management and audit route listed below; unknown routes fail closed.

Recruiter contact-message access and history CRUD preserve the existing operational policy. This phase does not introduce immutable history or automatic audit capture. Published public reads do not imply permission to enter a management screen. No client may TRUNCATE application tables or create triggers through table grants.

## Storage and SECURITY DEFINER review

| Private bucket | Owner | Administrator | Recruiter | Content editor | Other / anonymous |
| --- | --- | --- | --- | --- | --- |
| recruitment-documents | CRUD | CRUD | CRUD | — | — |
| public-media | CRUD | CRUD | — | CRUD | — |

Storage permissions cover every object in the permitted bucket; no per-applicant assignment model exists. Object SELECT governs list and authenticated download access. Existing object INSERT/UPDATE/DELETE policies already match these groups and are retained. Both buckets remain private. Published media metadata does not grant object access. Public delivery requires a future approved server/CDN mechanism; previously issued signed URLs can remain usable until expiry and should have short lifetimes.

`has_staff_role(text[])` remains STABLE SECURITY DEFINER to read profiles without recursive RLS. It uses an empty search path, explicitly qualified table/Auth references, no dynamic SQL, and only the current caller's UUID. PUBLIC and anon execution are revoked; authenticated execution is explicitly granted. The function owner must remain a trusted migration/database owner able to read profiles; never transfer it to a browser role. Other existing functions are invoker functions. Storage service roles and database maintenance owners bypass ordinary RLS and must never be exposed to browser clients.

## Validation and local procedure

Reviewed all three existing migrations and preserved them. Added [transactional SQL regression checks](supabase/tests/phase28_authorization.sql), using fictional Auth UUIDs, profile rows, applicant data and storage metadata; all fixtures roll back. Run only on a disposable local Supabase database after applying all migrations, as its postgres owner:

```sh
psql '<local-connection-string>' -X -v ON_ERROR_STOP=1 -f supabase/tests/phase28_authorization.sql
```

Execution is pending: psql is installed, but the local Docker engine is unavailable. The script checks all four active roles, inactive staff, no-profile users and anonymous visitors; self-profile isolation; escalation attempts; private metadata and object visibility; unauthorized object deletion; permitted applicant updates; forbidden applicant creation; audit write and TRUNCATE denial. This is focused regression coverage, not an exhaustive CRUD test of every table. Real Auth login/logout, HTTP Storage download/upload, signed URL behavior, and full per-table CRUD integration tests remain pending. SQL object metadata fixtures do not upload actual files. No build/lint claims are made for this database-only scope.

For an initial development owner, create a disposable user through the Supabase Authentication dashboard, then insert a matching `staff_profiles` row with that Auth UUID, `role = 'owner'`, and `active = true` using a trusted database administration connection. Keep passwords and actual UUIDs out of source control. Create additional disposable identities for each role and the disabled/no-profile cases before live integration checks. Never bootstrap through an anonymous client or a public registration form.

No remote migration, commit, push or deployment was performed. The existing dirty AGENTS.md was preserved. Applied migration rollout and real-role verification are required before treating Phase 28 authorization as verified in a hosted environment. GitHub Pages route gating is only presentation; RLS remains the data boundary.
