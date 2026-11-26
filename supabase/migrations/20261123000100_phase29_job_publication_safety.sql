-- Phase 29: complete internal job management while static public detail
-- generation cannot safely route database-created slugs.
create or replace function public.guard_job_publication()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.status = 'published' then
    raise exception 'Publication is blocked until public job-detail routing can include database-created jobs.';
  end;
  return new;
end;
$$;

drop trigger if exists guard_job_publication on public.jobs;
create trigger guard_job_publication
  before insert or update of status on public.jobs
  for each row execute function public.guard_job_publication();

create or replace function public.log_job_change()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.audit_logs(actor_id, action, table_name, record_id, metadata)
  values (
    (select auth.uid()),
    case
      when tg_op = 'INSERT' then 'job_created'
      when old.status is distinct from new.status then 'job_status_changed'
      else 'job_updated'
    end,
    'jobs',
    new.id,
    jsonb_build_object(
      'operation', tg_op,
      'old_status', case when tg_op = 'UPDATE' then old.status else null end,
      'new_status', new.status
    )
  );
  return new;
end;
$$;

drop trigger if exists log_job_change on public.jobs;
create trigger log_job_change
  after insert or update on public.jobs
  for each row execute function public.log_job_change();
