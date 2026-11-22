import type { Metadata } from "next";
import { jobCategories } from "@/data";
import { CategoriesClient } from "./CategoriesClient";
import { isSupabaseConfigured, readSupabaseJobCategories } from "@a1/database";

export const metadata: Metadata = { title: "Job Categories" };

export default async function CategoriesPage() {
  const result = await readSupabaseJobCategories();

  if (!isSupabaseConfigured()) {
    return <CategoriesClient initialCategories={jobCategories} />;
  }
  if (result.error) {
    return (
      <div>
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Supabase data is temporarily unavailable. Please retry.
        </p>
        <CategoriesClient initialCategories={[]} />
      </div>
    );
  }

  const liveCategories = (result.data ?? []).map((row) => ({
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    icon: String(row.icon),
    description: String(row.description),
    agencyConfirmed: Boolean(row.agency_confirmed),
    jobCount: 0,
    countries: [],
  }));

  return <CategoriesClient initialCategories={liveCategories} />;
}
