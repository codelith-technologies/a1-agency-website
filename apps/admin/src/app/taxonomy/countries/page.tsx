import type { Metadata } from "next";
import { countries } from "@/data";
import { CountriesClient } from "./CountriesClient";
import { isSupabaseConfigured, readSupabaseCountries } from "@a1/database";

export const metadata: Metadata = { title: "Destination Countries" };

export default async function CountriesPage() {
  const result = await readSupabaseCountries();

  if (!isSupabaseConfigured()) {
    return <CountriesClient initialCountries={countries} />;
  }
  if (result.error) {
    return (
      <div>
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Supabase data is temporarily unavailable. Please retry.
        </p>
        <CountriesClient initialCountries={[]} />
      </div>
    );
  }

  const liveCountries = (result.data ?? []).map((row) => ({
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    shortName: row.short_name ? String(row.short_name) : undefined,
    flag: String(row.flag),
    region: String(row.region),
    summary: String(row.summary),
    popularCategories: Array.isArray(row.popular_categories)
      ? row.popular_categories.map(String)
      : [],
    image: row.image_path ? String(row.image_path) : undefined,
    featured: Boolean(row.featured),
    active: Boolean(row.active),
  }));

  return <CountriesClient initialCountries={liveCountries} />;
}
