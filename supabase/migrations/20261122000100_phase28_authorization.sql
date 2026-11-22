-- Additive Phase 28 correction; do not rewrite the applied Phase 27 migrations.
-- Fully qualified references and an empty search path protect this definer
-- function from object shadowing. Only the caller's Auth UUID is inspected.
create or replace function public.has_staff_role(required_roles text[])
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.staff_profiles
    where user_id = (select auth.uid()) and active and role = any(required_roles)
  );
$$;

revoke all on function public.has_staff_role(text[]) from public, anon;
grant execute on function public.has_staff_role(text[]) to authenticated;

drop policy "staff can read staff profiles" on public.staff_profiles;
drop policy "owners can manage staff profiles" on public.staff_profiles;
create policy "owners can manage staff profiles" on public.staff_profiles
  for all to authenticated
  using (public.has_staff_role(array['owner']))
  with check (public.has_staff_role(array['owner']));
create policy "staff can read own staff profile" on public.staff_profiles
  for select to authenticated
  using (user_id = (select auth.uid()));
-- Self-SELECT includes inactive staff so clients can distinguish a disabled
-- profile. It grants no write capability.

drop policy "staff can manage media metadata" on public.media_assets;
create policy "staff can manage permitted media metadata" on public.media_assets
  for all to authenticated
  using (
    (bucket_id = 'public-media'
      and public.has_staff_role(array['owner', 'administrator', 'content_editor']))
    or (bucket_id = 'recruitment-documents'
      and public.has_staff_role(array['owner', 'administrator', 'recruiter']))
  )
  with check (
    (bucket_id = 'public-media'
      and public.has_staff_role(array['owner', 'administrator', 'content_editor']))
    or (bucket_id = 'recruitment-documents'
      and public.has_staff_role(array['owner', 'administrator', 'recruiter']))
  );

-- RLS does not constrain TRUNCATE, REFERENCES or TRIGGER privileges. Make
-- browser-facing grants explicit; preserve service-role/maintenance grants.
do $$
declare table_name text;
begin
  foreach table_name in array array[
    'countries', 'job_categories', 'jobs', 'applicants', 'job_applications',
    'application_status_history', 'employer_requests', 'contact_messages',
    'reviews', 'events', 'announcements', 'media_assets', 'faqs',
    'team_members', 'staff_profiles', 'audit_logs'
  ] loop
    execute format('revoke all on table public.%I from public, anon, authenticated', table_name);
    execute format('grant select, insert, update, delete on table public.%I to authenticated', table_name);
  end loop;
  foreach table_name in array array[
    'countries', 'job_categories', 'jobs', 'reviews', 'events',
    'announcements', 'media_assets', 'faqs', 'team_members'
  ] loop
    execute format('grant select on table public.%I to anon', table_name);
  end loop;
end;
$$;

revoke insert, update, delete on public.audit_logs from authenticated;
-- Storage policies already enforce the same content/recruitment groups.
-- Neither bucket is made public; no anonymous storage policy is introduced.
