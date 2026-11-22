-- Development-only seed data. Every job is draft by design.
insert into public.countries (slug, name, short_name, flag, region, summary, image_path, featured)
values
  ('malaysia', 'Malaysia', null, '🇲🇾', 'Southeast Asia', 'Development recruitment market.', '/images/countries/placeholders/global-market.svg', false),
  ('united-arab-emirates', 'United Arab Emirates (Dubai)', 'UAE', '🇦🇪', 'Middle East', 'Development recruitment market.', '/images/countries/featured/united-arab-emirates.webp', true),
  ('kuwait', 'Kuwait', null, '🇰🇼', 'Middle East', 'Development recruitment market.', '/images/countries/featured/kuwait.webp', true),
  ('oman', 'Oman', null, '🇴🇲', 'Middle East', 'Development recruitment market.', '/images/countries/featured/oman.webp', true),
  ('qatar', 'Qatar', null, '🇶🇦', 'Middle East', 'Development recruitment market.', '/images/countries/featured/qatar.webp', true),
  ('bahrain', 'Bahrain', null, '🇧🇭', 'Middle East', 'Development recruitment market.', '/images/countries/featured/bahrain.webp', true),
  ('cyprus', 'Cyprus', null, '🇨🇾', 'Europe', 'Development recruitment market.', '/images/countries/placeholders/global-market.svg', false),
  ('saudi-arabia', 'Saudi Arabia', null, '🇸🇦', 'Middle East', 'Development recruitment market.', '/images/countries/featured/saudi-arabia.webp', true),
  ('singapore', 'Singapore', null, '🇸🇬', 'Southeast Asia', 'Development recruitment market.', '/images/countries/placeholders/global-market.svg', false),
  ('israel', 'Israel', null, '🇮🇱', 'Middle East', 'Development recruitment market.', '/images/countries/placeholders/global-market.svg', false),
  ('romania', 'Romania', null, '🇷🇴', 'Europe', 'Development recruitment market.', '/images/countries/placeholders/global-market.svg', false),
  ('finland', 'Finland', null, '🇫🇮', 'Europe', 'Development recruitment market.', '/images/countries/placeholders/global-market.svg', false),
  ('poland', 'Poland', null, '🇵🇱', 'Europe', 'Development recruitment market.', '/images/countries/placeholders/global-market.svg', false),
  ('germany', 'Germany', null, '🇩🇪', 'Europe', 'Development recruitment market.', '/images/countries/placeholders/global-market.svg', false),
  ('turkey', 'Turkey', null, '🇹🇷', 'Europe & Asia', 'Development recruitment market.', '/images/countries/placeholders/global-market.svg', false)
on conflict (slug) do update set name = excluded.name, short_name = excluded.short_name,
  flag = excluded.flag, region = excluded.region, summary = excluded.summary,
  image_path = excluded.image_path, featured = excluded.featured;

insert into public.job_categories (slug, name, icon, description, agency_confirmed, is_published)
values
  ('hospitality', 'Hospitality', 'Hotel', 'Development category.', true, true),
  ('barista', 'Barista', 'Coffee', 'Development category.', true, true),
  ('construction', 'Construction', 'HardHat', 'Development category.', true, true),
  ('domestic-services', 'Domestic Services', 'House', 'Development category.', true, true),
  ('cleaning-services', 'Cleaning Services', 'Sparkles', 'Development category.', true, true),
  ('general-helpers', 'General / Unskilled Helpers', 'Users', 'Development category.', true, true),
  ('engineering', 'Engineering', 'Cog', 'Development category.', true, true),
  ('drivers', 'Driving', 'Car', 'Development category.', true, true),
  ('healthcare', 'Nursing & Healthcare', 'HeartPulse', 'Development category.', true, true),
  ('garment-industry', 'Garment Industry', 'Shirt', 'Development category.', true, true),
  ('beauty-personal-care', 'Beauty & Personal Care', 'Scissors', 'Development category.', true, true),
  ('agriculture', 'Agriculture', 'Sprout', 'Development category.', true, true),
  ('finance', 'Finance', 'Landmark', 'Development category.', true, true),
  ('security', 'Security', 'Shield', 'Legacy development category.', false, false),
  ('electricians', 'Electricians', 'Zap', 'Legacy development category.', false, false),
  ('mechanics', 'Mechanics & Auto', 'Wrench', 'Legacy development category.', false, false),
  ('warehouse-logistics', 'Warehouse & Logistics', 'Package', 'Legacy development category.', false, false),
  ('technicians', 'Technicians', 'Cpu', 'Legacy development category.', false, false)
on conflict (slug) do update set name = excluded.name, icon = excluded.icon,
  description = excluded.description, agency_confirmed = excluded.agency_confirmed,
  is_published = excluded.is_published;

insert into public.jobs (
  reference, slug, title, country_id, category_id, employer_name, city,
  salary_min, salary_max, currency, vacancy_count, description, closing_date, status
)
select 'A1-DEMO-001', 'heavy-vehicle-driver-saudi-arabia', 'Heavy Vehicle Driver',
  c.id, cat.id, 'International Employer - Saudi Arabia', 'Riyadh',
  1200, 1500, 'SAR', 1,
  'Fictional development job used to validate the database foundation.',
  current_date + 90, 'draft'
from public.countries c
join public.job_categories cat on cat.slug = 'drivers'
where c.slug = 'saudi-arabia'
on conflict (reference) do update set title = excluded.title,
  country_id = excluded.country_id, category_id = excluded.category_id,
  status = 'draft', published_at = null;

insert into public.faqs (id, question, answer, category, display_order, status)
values
  ('00000000-0000-4000-8000-000000000001', 'How can I apply for an overseas job?', 'Browse available roles and contact A-One to confirm how to apply for a current vacancy.', 'Applying for Jobs', 1, 'published'),
  ('00000000-0000-4000-8000-000000000002', 'Do I need previous overseas experience?', 'Experience requirements depend on the vacancy and employer.', 'Applying for Jobs', 2, 'published'),
  ('00000000-0000-4000-8000-000000000003', 'Can I apply for multiple jobs?', 'You can explore more than one role, but confirm the arrangements with A-One.', 'Applying for Jobs', 3, 'published'),
  ('00000000-0000-4000-8000-000000000004', 'What documents are normally required?', 'Requirements vary by vacancy and destination and may include identification, passport, CV, qualifications and experience records.', 'Documents', 4, 'published'),
  ('00000000-0000-4000-8000-000000000005', 'Do I need a passport before applying?', 'Passport requirements depend on the vacancy and applicable travel processes.', 'Documents', 5, 'published'),
  ('00000000-0000-4000-8000-000000000006', 'How will I know whether I am shortlisted?', 'The recruitment team will explain how updates are communicated for a confirmed application.', 'Recruitment Process', 6, 'published'),
  ('00000000-0000-4000-8000-000000000007', 'How long does recruitment take?', 'Timing varies with employer selection, documents, medical checks, visas and official processes.', 'Recruitment Process', 7, 'published'),
  ('00000000-0000-4000-8000-000000000008', 'Will I need an interview?', 'Depending on the role, shortlisted candidates may attend an interview or practical assessment.', 'Recruitment Process', 8, 'published'),
  ('00000000-0000-4000-8000-000000000009', 'What regulatory approvals are required?', 'Candidates should follow current SLBFE and relevant authority requirements for their destination and vacancy.', 'Overseas Employment', 9, 'published'),
  ('00000000-0000-4000-8000-000000000010', 'Are job offers guaranteed?', 'No. Final selection depends on employer requirements and official or visa processes.', 'Overseas Employment', 10, 'published'),
  ('00000000-0000-4000-8000-000000000011', 'How can an overseas company recruit through A-One?', 'Contact A-One to discuss workforce needs, roles and proposed employment terms.', 'Employer Services', 11, 'published'),
  ('00000000-0000-4000-8000-000000000012', 'How can I contact the recruitment team?', 'Use A-One published phone, email and office contact details.', 'Contact & Support', 12, 'published')
on conflict (id) do update set
  question = excluded.question,
  answer = excluded.answer,
  category = excluded.category,
  display_order = excluded.display_order,
  status = 'published';
