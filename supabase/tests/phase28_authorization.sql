-- LOCAL disposable Supabase database only. Run after all migrations as postgres:
-- psql <local-connection-string> -X -v ON_ERROR_STOP=1 -f supabase/tests/phase28_authorization.sql
-- Transaction rolls back every fictional fixture. No Auth passwords or real files.
begin;
create function pg_temp.assert_true(ok boolean, message text) returns void
language plpgsql as $$ begin
  if ok is distinct from true then raise exception 'FAIL: %', message; end if;
end $$;
create function pg_temp.expect_denied(statement text) returns void
language plpgsql as $$ begin
  begin execute statement;
  exception when insufficient_privilege then return;
  end;
  raise exception 'Expected permission denial: %', statement;
end $$;
insert into auth.users (id) values ('28000000-0000-4000-8000-000000000001');
insert into public.staff_profiles(user_id, role, active) values ('28000000-0000-4000-8000-000000000001', 'owner', true);
insert into auth.users (id) values ('28000000-0000-4000-8000-000000000002');
insert into public.staff_profiles(user_id, role, active) values ('28000000-0000-4000-8000-000000000002', 'administrator', true);
insert into auth.users (id) values ('28000000-0000-4000-8000-000000000003');
insert into public.staff_profiles(user_id, role, active) values ('28000000-0000-4000-8000-000000000003', 'recruiter', true);
insert into auth.users (id) values ('28000000-0000-4000-8000-000000000004');
insert into public.staff_profiles(user_id, role, active) values ('28000000-0000-4000-8000-000000000004', 'content_editor', true);
insert into auth.users (id) values ('28000000-0000-4000-8000-000000000005');
insert into public.staff_profiles(user_id, role, active) values ('28000000-0000-4000-8000-000000000005', 'owner', false);
insert into auth.users (id) values ('28000000-0000-4000-8000-000000000006');
insert into public.applicants(id,full_name,nic,phone)
values ('28000000-0000-4000-8000-000000000010','Phase28 fictional','phase28-test-only','000');
insert into public.media_assets(bucket_id,storage_path,mime_type,file_size)
values ('recruitment-documents','phase28-test/private.pdf','application/pdf',1),
('public-media','phase28-test/public.png','image/png',1);
insert into storage.objects(bucket_id,name)
values ('recruitment-documents','phase28-test/private.pdf'),
('public-media','phase28-test/public.png');

-- owner
set local role authenticated;
select set_config('request.jwt.claim.sub','28000000-0000-4000-8000-000000000001',true);
select pg_temp.assert_true((select count(*) from public.staff_profiles where user_id::text like '28000000-%') = 5, 'owner profile visibility');
select pg_temp.assert_true(public.has_staff_role(array['owner','administrator','recruiter','content_editor']) = true, 'owner active gate');
select pg_temp.assert_true((select count(*) from public.applicants where nic='phase28-test-only') = 1, 'owner applicant visibility');
select pg_temp.assert_true((select count(*) from public.media_assets where storage_path='phase28-test/private.pdf') = 1, 'owner private metadata');
select pg_temp.assert_true((select count(*) from storage.objects where name='phase28-test/private.pdf') = 1, 'owner private storage');
select pg_temp.assert_true((select count(*) from storage.objects where name='phase28-test/public.png') = 1, 'owner media storage');
select pg_temp.expect_denied($q$insert into public.audit_logs(action,table_name) values ('forged','test')$q$);
select pg_temp.expect_denied('truncate public.applicants');
with changed as (update public.applicants set full_name='Phase28 fictional updated' where nic='phase28-test-only' returning *) select pg_temp.assert_true(count(*)=1,'owner permitted applicant update') from changed;
reset role;

-- administrator
set local role authenticated;
select set_config('request.jwt.claim.sub','28000000-0000-4000-8000-000000000002',true);
select pg_temp.assert_true((select count(*) from public.staff_profiles where user_id::text like '28000000-%') = 1, 'administrator profile visibility');
select pg_temp.assert_true(public.has_staff_role(array['owner','administrator','recruiter','content_editor']) = true, 'administrator active gate');
select pg_temp.assert_true((select count(*) from public.applicants where nic='phase28-test-only') = 1, 'administrator applicant visibility');
select pg_temp.assert_true((select count(*) from public.media_assets where storage_path='phase28-test/private.pdf') = 1, 'administrator private metadata');
select pg_temp.assert_true((select count(*) from storage.objects where name='phase28-test/private.pdf') = 1, 'administrator private storage');
select pg_temp.assert_true((select count(*) from storage.objects where name='phase28-test/public.png') = 1, 'administrator media storage');
with changed as (update public.staff_profiles set role='owner' where user_id='28000000-0000-4000-8000-000000000002' returning *) select pg_temp.assert_true(count(*)=0,'administrator cannot elevate') from changed;
select pg_temp.expect_denied($q$insert into public.staff_profiles(user_id,role) values ('28000000-0000-4000-8000-000000000006','owner')$q$);
select pg_temp.expect_denied($q$insert into public.audit_logs(action,table_name) values ('forged','test')$q$);
select pg_temp.expect_denied('truncate public.applicants');
with changed as (update public.applicants set full_name='Phase28 fictional updated' where nic='phase28-test-only' returning *) select pg_temp.assert_true(count(*)=1,'administrator permitted applicant update') from changed;
reset role;

-- recruiter
set local role authenticated;
select set_config('request.jwt.claim.sub','28000000-0000-4000-8000-000000000003',true);
select pg_temp.assert_true((select count(*) from public.staff_profiles where user_id::text like '28000000-%') = 1, 'recruiter profile visibility');
select pg_temp.assert_true(public.has_staff_role(array['owner','administrator','recruiter','content_editor']) = true, 'recruiter active gate');
select pg_temp.assert_true((select count(*) from public.applicants where nic='phase28-test-only') = 1, 'recruiter applicant visibility');
select pg_temp.assert_true((select count(*) from public.media_assets where storage_path='phase28-test/private.pdf') = 1, 'recruiter private metadata');
select pg_temp.assert_true((select count(*) from storage.objects where name='phase28-test/private.pdf') = 1, 'recruiter private storage');
select pg_temp.assert_true((select count(*) from storage.objects where name='phase28-test/public.png') = 0, 'recruiter media storage');
with changed as (update public.staff_profiles set role='owner' where user_id='28000000-0000-4000-8000-000000000003' returning *) select pg_temp.assert_true(count(*)=0,'recruiter cannot elevate') from changed;
select pg_temp.expect_denied($q$insert into public.staff_profiles(user_id,role) values ('28000000-0000-4000-8000-000000000006','owner')$q$);
select pg_temp.expect_denied($q$insert into public.audit_logs(action,table_name) values ('forged','test')$q$);
select pg_temp.expect_denied('truncate public.applicants');
with changed as (update public.applicants set full_name='Phase28 fictional updated' where nic='phase28-test-only' returning *) select pg_temp.assert_true(count(*)=1,'recruiter permitted applicant update') from changed;
reset role;

-- content_editor
set local role authenticated;
select set_config('request.jwt.claim.sub','28000000-0000-4000-8000-000000000004',true);
select pg_temp.assert_true((select count(*) from public.staff_profiles where user_id::text like '28000000-%') = 1, 'content_editor profile visibility');
select pg_temp.assert_true(public.has_staff_role(array['owner','administrator','recruiter','content_editor']) = true, 'content_editor active gate');
select pg_temp.assert_true((select count(*) from public.applicants where nic='phase28-test-only') = 0, 'content_editor applicant visibility');
select pg_temp.assert_true((select count(*) from public.media_assets where storage_path='phase28-test/private.pdf') = 0, 'content_editor private metadata');
select pg_temp.assert_true((select count(*) from storage.objects where name='phase28-test/private.pdf') = 0, 'content_editor private storage');
select pg_temp.assert_true((select count(*) from storage.objects where name='phase28-test/public.png') = 1, 'content_editor media storage');
with changed as (update public.staff_profiles set role='owner' where user_id='28000000-0000-4000-8000-000000000004' returning *) select pg_temp.assert_true(count(*)=0,'content_editor cannot elevate') from changed;
select pg_temp.expect_denied($q$insert into public.staff_profiles(user_id,role) values ('28000000-0000-4000-8000-000000000006','owner')$q$);
select pg_temp.expect_denied($q$insert into public.audit_logs(action,table_name) values ('forged','test')$q$);
select pg_temp.expect_denied('truncate public.applicants');
select pg_temp.expect_denied($q$insert into public.applicants(full_name,nic,phone) values ('fictional','phase28-denied','000')$q$);
with removed as (delete from storage.objects where name='phase28-test/private.pdf' returning *) select pg_temp.assert_true(count(*)=0,'content_editor cannot delete documents') from removed;
reset role;

-- inactive
set local role authenticated;
select set_config('request.jwt.claim.sub','28000000-0000-4000-8000-000000000005',true);
select pg_temp.assert_true((select count(*) from public.staff_profiles where user_id::text like '28000000-%') = 1, 'inactive profile visibility');
select pg_temp.assert_true(public.has_staff_role(array['owner','administrator','recruiter','content_editor']) = false, 'inactive active gate');
select pg_temp.assert_true((select count(*) from public.applicants where nic='phase28-test-only') = 0, 'inactive applicant visibility');
select pg_temp.assert_true((select count(*) from public.media_assets where storage_path='phase28-test/private.pdf') = 0, 'inactive private metadata');
select pg_temp.assert_true((select count(*) from storage.objects where name='phase28-test/private.pdf') = 0, 'inactive private storage');
select pg_temp.assert_true((select count(*) from storage.objects where name='phase28-test/public.png') = 0, 'inactive media storage');
with changed as (update public.staff_profiles set role='owner' where user_id='28000000-0000-4000-8000-000000000005' returning *) select pg_temp.assert_true(count(*)=0,'inactive cannot elevate') from changed;
select pg_temp.expect_denied($q$insert into public.staff_profiles(user_id,role) values ('28000000-0000-4000-8000-000000000006','owner')$q$);
select pg_temp.expect_denied($q$insert into public.audit_logs(action,table_name) values ('forged','test')$q$);
select pg_temp.expect_denied('truncate public.applicants');
select pg_temp.expect_denied($q$insert into public.applicants(full_name,nic,phone) values ('fictional','phase28-denied','000')$q$);
with removed as (delete from storage.objects where name='phase28-test/private.pdf' returning *) select pg_temp.assert_true(count(*)=0,'inactive cannot delete documents') from removed;
reset role;

-- no_profile
set local role authenticated;
select set_config('request.jwt.claim.sub','28000000-0000-4000-8000-000000000006',true);
select pg_temp.assert_true((select count(*) from public.staff_profiles where user_id::text like '28000000-%') = 0, 'no_profile profile visibility');
select pg_temp.assert_true(public.has_staff_role(array['owner','administrator','recruiter','content_editor']) = false, 'no_profile active gate');
select pg_temp.assert_true((select count(*) from public.applicants where nic='phase28-test-only') = 0, 'no_profile applicant visibility');
select pg_temp.assert_true((select count(*) from public.media_assets where storage_path='phase28-test/private.pdf') = 0, 'no_profile private metadata');
select pg_temp.assert_true((select count(*) from storage.objects where name='phase28-test/private.pdf') = 0, 'no_profile private storage');
select pg_temp.assert_true((select count(*) from storage.objects where name='phase28-test/public.png') = 0, 'no_profile media storage');
with changed as (update public.staff_profiles set role='owner' where user_id='28000000-0000-4000-8000-000000000006' returning *) select pg_temp.assert_true(count(*)=0,'no_profile cannot elevate') from changed;
select pg_temp.expect_denied($q$insert into public.staff_profiles(user_id,role) values ('28000000-0000-4000-8000-000000000006','owner')$q$);
select pg_temp.expect_denied($q$insert into public.audit_logs(action,table_name) values ('forged','test')$q$);
select pg_temp.expect_denied('truncate public.applicants');
select pg_temp.expect_denied($q$insert into public.applicants(full_name,nic,phone) values ('fictional','phase28-denied','000')$q$);
with removed as (delete from storage.objects where name='phase28-test/private.pdf' returning *) select pg_temp.assert_true(count(*)=0,'no_profile cannot delete documents') from removed;
reset role;
set local role anon;
select set_config('request.jwt.claim.sub','',true);
select pg_temp.expect_denied('select * from public.applicants');
select pg_temp.expect_denied('select * from public.staff_profiles');
select pg_temp.assert_true((select count(*) from storage.objects where name like 'phase28-test/%')=0,'anonymous storage denial');
reset role;
select pg_temp.assert_true(not exists(select 1 from storage.buckets where id in ('public-media','recruitment-documents') and public),'private buckets');
rollback;

