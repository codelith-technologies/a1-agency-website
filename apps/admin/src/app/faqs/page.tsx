import type { Metadata } from "next";
import { faqs } from "@/data";
import { FAQsClient } from "./FAQsClient";

export const metadata: Metadata = { title: "FAQs" };

export default function FAQsPage() {
  return <FAQsClient initialFaqs={faqs} />;
}
