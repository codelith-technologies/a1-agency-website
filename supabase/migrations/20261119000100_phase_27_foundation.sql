create extension if not exists "pgcrypto";

create table if not exists public.countries (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  short_name text,
  flag text not null,
  region text not null,
  summary text not null,
  popular_categories text[] not null default '{}',
  image_path text,
  featured boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.job_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  icon text not null,
  description text not null,
  agency_confirmed boolean not null default false,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  slug text not null unique,
  title text not null,
  country_id uuid not null references public.countries(id) on delete restrict,
  category_id uuid not null references public.job_categories(id) on delete restrict,
  employer_name text not null,
  city text,
  salary_min numeric(12,2),
  salary_max numeric(12,2),
  currency text not null default 'LKR',
  minimum_age integer,
  maximum_age integer,
  vacancy_count integer not null default 1,
  employment_type text not null default 'full-time'
    check (employment_type in ('full-time', 'contract', 'temporary')),
  experience_level text not null default 'no-experience'
    check (experience_level in ('no-experience', 'entry', 'mid', 'senior')),
  experience_requirements text,
  description text not null,
  responsibilities text[] not null default '{}',
  qualifications text[] not null default '{}',
  benefits text[] not null default '{}',
  accommodation text,
  food text,
  transportation text,
  medical text,
  insurance text,
  working_hours text,
  contract_duration text,
  interview_information text,
  other_conditions text,
  closing_date date,
  published_at timestamptz,
  featured boolean not null default false,
  image_path text,
  tags text[] not null default '{}',
  status text not null default 'draft'
    check (status in ('draft', 'published', 'closed', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint jobs_salary_range check (
    salary_min is null or salary_max is null or salary_min <= salary_max
  ),
  constraint jobs_age_range check (
    minimum_age is null or maximum_age is null or minimum_age <= maximum_age
  ),
  constraint jobs_age_bounds check (
    (minimum_age is null or minimum_age between 15 and 100)
    and (maximum_age is null or maximum_age between 15 and 100)
  ),
  constraint jobs_vacancy_count check (vacancy_count > 0),
  constraint jobs_published_at check (status <> 'published' or published_at is not null)
);

create index if not exists jobs_publication_idx on public.jobs (status, closing_date);
create index if not exists jobs_country_idx on public.jobs (country_id);
create index if not exists jobs_category_idx on public.jobs (category_id);

create table if not exists public.applicants (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  nic text not null unique,
  email text,
  phone text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.job_applications (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  job_id uuid not null references public.jobs(id) on delete restrict,
  applicant_id uuid not null references public.applicants(id) on delete restrict,
  date_of_birth date,
  gender text,
  district text,
  address text,
  whatsapp text,
  current_occupation text,
  years_of_experience text,
  highest_qualification text,
  professional_qualifications text,
  relevant_skills text,
  driving_licence boolean,
  overseas_experience text,
  cv_storage_path text,
  recruiter_notes text,
  privacy_consent boolean not null default false check (privacy_consent),
  status text not null default 'APPLIED'
    check (status in ('APPLIED', 'REVIEWED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED',
      'INTERVIEWED', 'SELECTED', 'DOCUMENT_PROCESSING', 'MEDICAL', 'VISA_PROCESSING',
      'READY_FOR_DEPARTURE', 'DEPARTED', 'REJECTED', 'WITHDRAWN')),
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists applications_job_idx on public.job_applications (job_id);
create index if not exists applications_applicant_idx on public.job_applications (applicant_id);

create table if not exists public.application_status_history (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.job_applications(id) on delete restrict,
  from_status text,
  to_status text not null,
  changed_by uuid references auth.users(id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.employer_requests (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  country text not null,
  website text,
  contact_person text not null,
  position text not null,
  email text not null,
  phone text not null,
  industry text not null,
  job_title_required text not null,
  number_of_workers integer not null check (number_of_workers > 0),
  required_experience text not null,
  qualifications text,
  salary text,
  benefits text,
  expected_joining_date date,
  additional_requirements text,
  status text not null default 'pending'
    check (status in ('pending', 'reviewed', 'in_progress', 'closed')),
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  email text not null,
  subject text not null,
  message text not null,
  read boolean not null default false,
  submitted_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  review text not null,
  review_type text not null check (review_type in ('candidate', 'employer')),
  person_name text,
  role text,
  destination text,
  company text,
  country text,
  contact_role text,
  rating integer check (rating between 1 and 5),
  image_path text,
  logo_path text,
  verified boolean not null default false,
  is_demo boolean not null default true,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  event_date date not null,
  location text,
  image_path text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  published_at timestamptz,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  bucket_id text not null check (bucket_id in ('public-media', 'recruitment-documents')),
  storage_path text not null,
  alt_text text,
  mime_type text not null,
  file_size integer not null check (file_size > 0),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  unique (bucket_id, storage_path)
);

create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  category text not null,
  display_order integer not null default 0,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  bio text,
  image_path text,
  is_placeholder boolean not null default true,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.staff_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'administrator', 'recruiter', 'content_editor')),
  display_name text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  table_name text not null,
  record_id uuid,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'countries', 'job_categories', 'jobs', 'applicants', 'job_applications',
    'employer_requests', 'reviews', 'events', 'announcements', 'faqs',
    'team_members', 'staff_profiles'
  ] loop
    execute format('drop trigger if exists set_updated_at on public.%I', table_name);
    execute format(
      'create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      table_name
    );
  end loop;
end;
$$;

create or replace function public.has_staff_role(required_roles text[])
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.staff_profiles
    where user_id = (select auth.uid()) and active and role = any(required_roles)
  );
$$;

create or replace function public.job_accepts_applications(job_row public.jobs)
returns boolean language sql stable as $$
  select job_row.status = 'published'
    and (job_row.closing_date is null or job_row.closing_date >= current_date);
$$;

alter table public.countries enable row level security;
alter table public.job_categories enable row level security;
alter table public.jobs enable row level security;
alter table public.applicants enable row level security;
alter table public.job_applications enable row level security;
alter table public.application_status_history enable row level security;
alter table public.employer_requests enable row level security;
alter table public.contact_messages enable row level security;
alter table public.reviews enable row level security;
alter table public.events enable row level security;
alter table public.announcements enable row level security;
alter table public.media_assets enable row level security;
alter table public.faqs enable row level security;
alter table public.team_members enable row level security;
alter table public.staff_profiles enable row level security;
alter table public.audit_logs enable row level security;

create policy "public can read active countries" on public.countries
  for select to anon, authenticated using (active);
create policy "staff can manage countries" on public.countries for all to authenticated
  using (public.has_staff_role(array['owner', 'administrator', 'content_editor']))
  with check (public.has_staff_role(array['owner', 'administrator', 'content_editor']));
create policy "public can read published categories" on public.job_categories
  for select to anon, authenticated using (is_published);
create policy "staff can manage categories" on public.job_categories for all to authenticated
  using (public.has_staff_role(array['owner', 'administrator', 'content_editor']))
  with check (public.has_staff_role(array['owner', 'administrator', 'content_editor']));
create policy "public can read published jobs" on public.jobs
  for select to anon, authenticated using (status = 'published' and published_at <= now());
create policy "staff can manage jobs" on public.jobs for all to authenticated
  using (public.has_staff_role(array['owner', 'administrator', 'recruiter']))
  with check (public.has_staff_role(array['owner', 'administrator', 'recruiter']));

create policy "staff can manage applicants" on public.applicants for all to authenticated
  using (public.has_staff_role(array['owner', 'administrator', 'recruiter']))
  with check (public.has_staff_role(array['owner', 'administrator', 'recruiter']));
create policy "staff can manage applications" on public.job_applications for all to authenticated
  using (public.has_staff_role(array['owner', 'administrator', 'recruiter']))
  with check (public.has_staff_role(array['owner', 'administrator', 'recruiter']));
create policy "staff can manage application history" on public.application_status_history for all to authenticated
  using (public.has_staff_role(array['owner', 'administrator', 'recruiter']))
  with check (public.has_staff_role(array['owner', 'administrator', 'recruiter']));
create policy "staff can manage employer requests" on public.employer_requests for all to authenticated
  using (public.has_staff_role(array['owner', 'administrator', 'recruiter']))
  with check (public.has_staff_role(array['owner', 'administrator', 'recruiter']));
create policy "staff can manage contact messages" on public.contact_messages for all to authenticated
  using (public.has_staff_role(array['owner', 'administrator', 'recruiter']))
  with check (public.has_staff_role(array['owner', 'administrator', 'recruiter']));

create policy "public can read published reviews" on public.reviews
  for select to anon, authenticated using (status = 'published' and verified);
create policy "staff can manage reviews" on public.reviews for all to authenticated
  using (public.has_staff_role(array['owner', 'administrator', 'content_editor']))
  with check (public.has_staff_role(array['owner', 'administrator', 'content_editor']));
create policy "public can read published events" on public.events
  for select to anon, authenticated using (status = 'published');
create policy "staff can manage events" on public.events for all to authenticated
  using (public.has_staff_role(array['owner', 'administrator', 'content_editor']))
  with check (public.has_staff_role(array['owner', 'administrator', 'content_editor']));
create policy "public can read published announcements" on public.announcements
  for select to anon, authenticated using (status = 'published' and published_at <= now());
create policy "staff can manage announcements" on public.announcements for all to authenticated
  using (public.has_staff_role(array['owner', 'administrator', 'content_editor']))
  with check (public.has_staff_role(array['owner', 'administrator', 'content_editor']));
create policy "public can read published media metadata" on public.media_assets
  for select to anon, authenticated using (is_published and bucket_id = 'public-media');
create policy "staff can manage media metadata" on public.media_assets for all to authenticated
  using (public.has_staff_role(array['owner', 'administrator', 'content_editor']))
  with check (public.has_staff_role(array['owner', 'administrator', 'content_editor']));
create policy "public can read published faqs" on public.faqs
  for select to anon, authenticated using (status = 'published');
create policy "staff can manage faqs" on public.faqs for all to authenticated
  using (public.has_staff_role(array['owner', 'administrator', 'content_editor']))
  with check (public.has_staff_role(array['owner', 'administrator', 'content_editor']));
create policy "public can read published team members" on public.team_members
  for select to anon, authenticated using (status = 'published');
create policy "staff can manage team members" on public.team_members for all to authenticated
  using (public.has_staff_role(array['owner', 'administrator', 'content_editor']))
  with check (public.has_staff_role(array['owner', 'administrator', 'content_editor']));

create policy "staff can read staff profiles" on public.staff_profiles for select to authenticated
  using (public.has_staff_role(array['owner', 'administrator', 'recruiter', 'content_editor']));
create policy "owners can manage staff profiles" on public.staff_profiles for all to authenticated
  using (public.has_staff_role(array['owner', 'administrator']))
  with check (public.has_staff_role(array['owner', 'administrator']));
create policy "staff can read audit logs" on public.audit_logs for select to authenticated
  using (public.has_staff_role(array['owner', 'administrator']));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('public-media', 'public-media', true, 5242880,
    array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']),
  ('recruitment-documents', 'recruitment-documents', false, 5242880,
    array['application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
on conflict (id) do update set public = excluded.public,
  file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "public can read published media files" on storage.objects
  for select to anon, authenticated using (bucket_id = 'public-media');
create policy "staff can upload public media" on storage.objects for insert to authenticated
  with check (bucket_id = 'public-media' and public.has_staff_role(array['owner', 'administrator', 'content_editor']));
create policy "staff can update public media" on storage.objects for update to authenticated
  using (bucket_id = 'public-media' and public.has_staff_role(array['owner', 'administrator', 'content_editor']))
  with check (bucket_id = 'public-media' and public.has_staff_role(array['owner', 'administrator', 'content_editor']));
create policy "staff can delete public media" on storage.objects for delete to authenticated
  using (bucket_id = 'public-media' and public.has_staff_role(array['owner', 'administrator', 'content_editor']));
create policy "staff can access recruitment documents" on storage.objects for all to authenticated
  using (bucket_id = 'recruitment-documents' and public.has_staff_role(array['owner', 'administrator', 'recruiter']))
  with check (bucket_id = 'recruitment-documents' and public.has_staff_role(array['owner', 'administrator', 'recruiter']));
