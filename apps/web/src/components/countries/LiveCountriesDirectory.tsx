"use client";

import { useEffect, useState } from "react";
import { isSupabaseConfigured, readSupabaseCountries } from "@a1/database";
import type { Country } from "@/types";
import CountryCard from "./CountryCard";
import CountriesDirectory from "./CountriesDirectory";
import { countrySampleJobs } from "@/lib/country-presentation";
import { countries as demoCountries, jobs as demoJobs } from "@/data";

export default function LiveCountriesDirectory({
  fallbackCount,
}: {
  fallbackCount: number;
}) {
  const [countries, setCountries] = useState<Country[]>(demoCountries);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"demo" | "live" | "error">(
    isSupabaseConfigured() ? "live" : "demo",
  );
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;

    readSupabaseCountries().then((result) => {
      if (!active) return;
      if (!result.configured) {
        setMode("demo");
        setCountries(demoCountries);
        return;
      }
      if (result.error) {
        setMode("error");
        setCountries([]);
        setError(result.error);
        return;
      }

      setMode("live");
      setError(null);
      const mapped = (result.data ?? []).map((row) => ({
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
        image: row.image_path ? String(row.image_path) : "/images/countries/placeholders/global-market.svg",
        featured: Boolean(row.featured),
        active: Boolean(row.active),
        status: "recruiting-market" as const,
      }));
      setCountries(mapped);
    });

    return () => {
      active = false;
    };
  }, [retry]);

  return (
    <div>
      {error && (
        <div role="alert" style={{ color: "#b91c1c", marginBottom: "1rem" }}>
          <p>{error}</p>
          <button type="button" onClick={() => setRetry((value) => value + 1)}>Retry</button>
        </div>
      )}
      {mode === "demo" && (
        <p role="status" style={{ marginBottom: "1rem" }}>
          Development demo data - Supabase is not configured.
        </p>
      )}
      <CountriesDirectory
        countries={countries}
        cards={countries.map((country) => (
          <CountryCard
            key={country.slug}
            country={country}
            sampleCount={mode === "demo" ? countrySampleJobs(demoJobs, country.slug).length : 0}
          />
        ))}
      />
      <span className="sr-only">{fallbackCount} demo-country fallback count is retained for static export.</span>
    </div>
  );
}
