"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { isSupabaseConfigured, readSupabaseJobCategories } from "@a1/database";
import type { JobCategory } from "@/types";
import { recruitmentFields } from "@/data";
import { CategoryIcon } from "@/lib/category-icons";
import JobCategoryGrid from "./JobCategoryGrid";
import styles from "./JobCategories.module.css";

export default function LiveRecruitmentFields() {
  const [categories, setCategories] = useState<JobCategory[]>(
    isSupabaseConfigured() ? [] : recruitmentFields,
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
        setCategories(recruitmentFields);
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
      setCategories((result.data ?? []).filter((row) => Boolean(row.agency_confirmed)).map((row) => ({
        id: String(row.id),
        slug: String(row.slug),
        name: String(row.name),
        icon: String(row.icon),
        description: String(row.description),
        agencyConfirmed: true,
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

  return (
    <>
      {mode === "demo" && (
        <p role="status" className={styles.description}>Development demo data - Supabase is not configured.</p>
      )}
      <JobCategoryGrid>
        {categories.map((category) => (
          <li key={category.slug}>
            <Link
              href={`/job-categories/${category.slug}`}
              className={styles.tile}
              aria-label={`Explore ${category.name} opportunities`}
            >
              <span className={styles.icon}>
                <CategoryIcon name={category.icon} size={22} strokeWidth={1.6} aria-hidden="true" />
              </span>
              <div className={styles.tileBody}>
                <h3 className={styles.title}>{category.name}</h3>
                <span className={styles.tileAction}>
                  View opportunities <ArrowRight size={15} aria-hidden="true" />
                </span>
              </div>
            </Link>
          </li>
        ))}
      </JobCategoryGrid>
    </>
  );
}
