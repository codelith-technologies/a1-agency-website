import type { Metadata } from "next";
import { faqs } from "@/data";
import { FAQsClient } from "./FAQsClient";
import { isSupabaseConfigured, readSupabasePublishedFaqs } from "@a1/database";

export const metadata: Metadata = { title: "FAQs" };

export default async function FAQsPage() {
  const result = await readSupabasePublishedFaqs();

  if (!isSupabaseConfigured()) {
    return <FAQsClient initialFaqs={faqs} />;
  }
  if (result.error) {
    return (
      <div>
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Supabase data is temporarily unavailable. Please retry.
        </p>
        <FAQsClient initialFaqs={[]} />
      </div>
    );
  }

  const liveFaqs = (result.data ?? []).map((row) => ({
    id: String(row.id),
    question: String(row.question),
    answer: String(row.answer),
    category: String(row.category),
    order: Number(row.display_order),
  }));

  return <FAQsClient initialFaqs={liveFaqs} />;
}
