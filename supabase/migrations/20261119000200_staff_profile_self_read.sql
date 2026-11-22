-- Staff users must be able to verify their own trusted role profile before
-- other role policies can authorize protected operations.
drop policy if exists "staff can read their own profile" on public.staff_profiles;

create policy "staff can read their own profile"
  on public.staff_profiles
  for select
  to authenticated
  using (user_id = (select auth.uid()));
