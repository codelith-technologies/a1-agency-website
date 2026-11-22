"use client";

import { useEffect, useState } from "react";
import { isSupabaseConfigured, readSupabaseJobCategories } from "@a1/database";
import type { JobCategory } from "@/types";
import { jobCategories as demoCategories } from "@/data";
import CategoryCard from "./CategoryCard";
import CategoryDirectory from "./CategoryDirectory";

export default function LiveCategoryDirectory({
  demoCards,
}: {
  demoCards: React.ReactNode[];
}) {
  const [categories, setCategories] = useState<JobCategory[]>(
    isSupabaseConfigured()
      ? []
      : demoCategories,
  );
  const [mode, setMode] = useState<"demo" | "live" | "error">(
    isSupabaseConfigured() ? "live" : "demo",
  );
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    readSupabaseJobCategories().then((result) => {
      if (!active) return;
      if (!result.configured) {
        setMode("demo");
        setCategories(demoCategories);
        return;
      }
      if (result.error) {
        setMode("error");
        setCategories([]);
        setError(result.error);
        return;
      }
      setMode("live");
      setError(null);
      setCategories((result.data ?? []).map((row) => ({
        id: String(row.id),
        slug: String(row.slug),
        name: String(row.name),
        icon: String(row.icon),
        description: String(row.description),
        agencyConfirmed: Boolean(row.agency_confirmed),
        jobCount: 0,
        countries: [],
      })));
    });
    return () => {
      active = false;
    };
  }, [retry]);

  if (mode === "error") {
    return (
      <div role="alert">
        <p>{error}</p>
        <button type="button" onClick={() => setRetry((value) => value + 1)}>Retry</button>
      </div>
    );
  }

  if (mode === "demo") {
    return (
      <div>
        <p role="status">Development demo data - Supabase is not configured.</p>
        <CategoryDirectory categories={demoCards.map((card, index) => ({
          slug: demoCategories[index].slug,
          name: demoCategories[index].name,
          agencyConfirmed: demoCategories[index].agencyConfirmed,
          card,
        }))} />
      </div>
    );
  }

  return (
    <CategoryDirectory
      categories={categories.map((category) => ({
        slug: category.slug,
        name: category.name,
        agencyConfirmed: category.agencyConfirmed,
        card: <CategoryCard category={category} sampleCount={0} destinationCount={0} compact={!category.agencyConfirmed} />,
      }))}
    />
  );
}
