import { createSupabaseBrowserClient } from "./client";

export type JobStatus = "draft" | "published" | "closed" | "archived";
export type ExperienceLevel = "no-experience" | "entry" | "mid" | "senior";
export type EmploymentType = "full-time" | "contract" | "temporary";

export type AdminJob = {
  id: string;
  reference: string;
  slug: string;
  title: string;
  country_id: string;
  category_id: string;
  employer_name: string;
  city: string | null;
  salary_min: number | null;
  salary_max: number | null;
  currency: string;
  minimum_age: number | null;
  maximum_age: number | null;
  vacancy_count: number;
  employment_type: EmploymentType;
  experience_level: ExperienceLevel;
  experience_requirements: string | null;
  description: string;
  responsibilities: string[];
  qualifications: string[];
  benefits: string[];
  accommodation: string | null;
  food: string | null;
  transportation: string | null;
  medical: string | null;
  insurance: string | null;
  working_hours: string | null;
  contract_duration: string | null;
  interview_information: string | null;
  other_conditions: string | null;
  closing_date: string | null;
  published_at: string | null;
  featured: boolean;
  image_path: string | null;
  tags: string[];
  status: JobStatus;
  created_at: string;
  updated_at: string;
  country?: { id?: string; slug?: string; name?: string; flag?: string } | null;
  category?: { id?: string; slug?: string; name?: string } | null;
};

export type JobOption = { id: string; slug: string; name: string };
export type JobPayload = Partial<Omit<AdminJob, "id" | "created_at" | "updated_at" | "country" | "category">> & {
  reference: string;
  slug: string;
  title: string;
  country_id: string;
  category_id: string;
  employer_name: string;
  currency: "LKR";
  vacancy_count: number;
  employment_type: EmploymentType;
  experience_level: ExperienceLevel;
  description: string;
  responsibilities: string[];
  qualifications: string[];
  benefits: string[];
};

const listColumns = `
  id,reference,slug,title,country_id,category_id,employer_name,city,
  salary_min,salary_max,currency,minimum_age,maximum_age,vacancy_count,
  employment_type,experience_level,experience_requirements,description,
  responsibilities,qualifications,benefits,accommodation,food,transportation,
  medical,insurance,working_hours,contract_duration,interview_information,
  other_conditions,closing_date,published_at,featured,image_path,tags,status,
  created_at,updated_at,
  country:countries(id,slug,name,flag),
  category:job_categories(id,slug,name)
`;

export async function listAdminJobOptions(): Promise<{ countries: JobOption[]; categories: JobOption[]; error: string | null }> {
  const client = createSupabaseBrowserClient();
  if (!client) return { countries: [], categories: [], error: "Supabase is not configured." };
  const [countriesResult, categoriesResult] = await Promise.all([
    client.from("countries").select("id,slug,name").eq("active", true).order("name"),
    client.from("job_categories").select("id,slug,name").eq("is_published", true).order("name"),
  ]);
  if (countriesResult.error || categoriesResult.error) return { countries: [], categories: [], error: "Could not load country and category options." };
  return {
    countries: (countriesResult.data ?? []) as JobOption[],
    categories: (categoriesResult.data ?? []) as JobOption[],
    error: null,
  };
}

export async function listAdminJobs(): Promise<{ jobs: AdminJob[]; error: string | null }> {
  const client = createSupabaseBrowserClient();
  if (!client) return { jobs: [], error: "Supabase is not configured." };
  const { data, error } = await client.from("jobs").select(listColumns).order("created_at", { ascending: false });
  if (error) return { jobs: [], error: "Could not load job vacancies." };
  return { jobs: (data ?? []) as unknown as AdminJob[], error: null };
}

export async function getAdminJob(id: string): Promise<{ job: AdminJob | null; error: string | null }> {
  const client = createSupabaseBrowserClient();
  if (!client) return { job: null, error: "Supabase is not configured." };
  const { data, error } = await client.from("jobs").select(listColumns).eq("id", id).maybeSingle();
  if (error) return { job: null, error: "Could not load this job vacancy." };
  if (!data) return { job: null, error: "Job not found." };
  return { job: data as unknown as AdminJob, error: null };
}

export function duplicateJobError(error: unknown): string | null {
  const value = error as { code?: string; message?: string };
  if (value.code === "23505" || /duplicate|unique/i.test(value.message ?? "")) {
    if (/slug/i.test(value.message ?? "")) return "That job slug is already in use.";
    return "That job reference or slug is already in use.";
  }
  if (/foreign key|country|category/i.test(value.message ?? "")) return "The selected country or category is invalid.";
  return null;
}

export async function insertAdminJob(payload: JobPayload): Promise<{ job: AdminJob | null; error: string | null }> {
  const client = createSupabaseBrowserClient();
  if (!client) return { job: null, error: "Supabase is not configured." };
  const { data, error } = await client.from("jobs").insert(payload).select("id").single();
  if (error) return { job: null, error: duplicateJobError(error) ?? "Could not save the job vacancy." };
  return { job: data as unknown as AdminJob, error: null };
}

export async function updateAdminJob(id: string, updatedAt: string, payload: Partial<JobPayload>): Promise<{ job: AdminJob | null; conflict: boolean; error: string | null }> {
  const client = createSupabaseBrowserClient();
  if (!client) return { job: null, conflict: false, error: "Supabase is not configured." };
  const { data, error } = await client.from("jobs").update(payload).eq("id", id).eq("updated_at", updatedAt).select(listColumns).maybeSingle();
  if (error) return { job: null, conflict: false, error: duplicateJobError(error) ?? "Could not update the job vacancy." };
  if (!data) return { job: null, conflict: true, error: "This job changed in another session. Reload before saving again." };
  return { job: data as unknown as AdminJob, conflict: false, error: null };
}

