"use client";

import { useEffect, useState } from "react";
import { isSupabaseConfigured, readSupabasePublishedFaqs } from "@a1/database";
import type { PublicFAQ } from "@/data/faqs";
import FAQExplorer from "./FAQExplorer";

export default function LiveFAQExplorer({
  fallbackFaqs,
}: {
  fallbackFaqs: PublicFAQ[];
}) {
  const [faqs, setFaqs] = useState<PublicFAQ[]>(fallbackFaqs);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"demo" | "live" | "error">(
    isSupabaseConfigured() ? "live" : "demo",
  );
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;

    readSupabasePublishedFaqs().then((result) => {
      if (!active) return;
      if (!result.configured) {
        setMode("demo");
        setFaqs(fallbackFaqs);
        return;
      }
      if (result.error) {
        setMode("error");
        setFaqs([]);
        setError(result.error);
        return;
      }

      setMode("live");
      setError(null);
      setFaqs(
        (result.data ?? []).map((row) => ({
          id: String(row.id),
          question: String(row.question),
          answer: String(row.answer),
          category: String(row.category),
          order: Number(row.display_order),
        })),
      );
    });

    return () => {
      active = false;
    };
  }, [fallbackFaqs, retry]);

  return (
    <>
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
      <FAQExplorer faqs={[...faqs].sort((a, b) => a.order - b.order)} />
    </>
  );
}
