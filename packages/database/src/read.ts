import { createSupabaseBrowserClient } from "./client";

export type SupabaseReadResult<T> =
  | { configured: false; data: T[]; error: null }
  | { configured: true; data: T[]; error: null }
  | { configured: true; data: null; error: string };

const PUBLIC_READ_ERROR = "Supabase data is temporarily unavailable.";

export async function readSupabaseCountries() {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) {
    return { configured: false, data: [], error: null } as SupabaseReadResult<Record<string, unknown>>;
  }

  const { data, error } = await supabase
    .from("countries")
    .select("id,slug,name,short_name,flag,region,summary,popular_categories,image_path,featured,active")
    .eq("active", true)
    .order("name");

  return error
    ? { configured: true, data: null, error: PUBLIC_READ_ERROR } as SupabaseReadResult<Record<string, unknown>>
    : { configured: true, data: data ?? [], error: null } as SupabaseReadResult<Record<string, unknown>>;
}

export async function readSupabaseJobCategories() {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) {
    return { configured: false, data: [], error: null } as SupabaseReadResult<Record<string, unknown>>;
  }

  const { data, error } = await supabase
    .from("job_categories")
    .select("id,slug,name,icon,description,agency_confirmed")
    .eq("is_published", true)
    .order("name");

  return error
    ? { configured: true, data: null, error: PUBLIC_READ_ERROR } as SupabaseReadResult<Record<string, unknown>>
    : { configured: true, data: data ?? [], error: null } as SupabaseReadResult<Record<string, unknown>>;
}

export async function readSupabasePublishedJobs() {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) {
    return { configured: false, data: [], error: null } as SupabaseReadResult<Record<string, unknown>>;
  }

  const { data, error } = await supabase
    .from("jobs")
    .select(`
      id,reference,slug,title,country_id,category_id,employer_name,city,
      salary_min,salary_max,currency,minimum_age,maximum_age,vacancy_count,
      employment_type,experience_level,experience_requirements,description,
      responsibilities,qualifications,benefits,accommodation,food,transportation,
      medical,insurance,working_hours,contract_duration,interview_information,
      other_conditions,closing_date,published_at,featured,image_path,tags,status,
      created_at,updated_at,
      country:countries(slug,name,flag),
      category:job_categories(slug,name)
    `)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  return error
    ? { configured: true, data: null, error: PUBLIC_READ_ERROR } as SupabaseReadResult<Record<string, unknown>>
    : { configured: true, data: data ?? [], error: null } as SupabaseReadResult<Record<string, unknown>>;
}

export async function readSupabasePublishedFaqs() {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) {
    return { configured: false, data: [], error: null } as SupabaseReadResult<Record<string, unknown>>;
  }

  const { data, error } = await supabase
    .from("faqs")
    .select("id,question,answer,category,display_order")
    .eq("status", "published")
    .order("display_order");

  return error
    ? { configured: true, data: null, error: PUBLIC_READ_ERROR } as SupabaseReadResult<Record<string, unknown>>
    : { configured: true, data: data ?? [], error: null } as SupabaseReadResult<Record<string, unknown>>;
}
