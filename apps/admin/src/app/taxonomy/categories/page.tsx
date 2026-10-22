import type { Metadata } from "next";
import { jobCategories } from "@/data";
import { CategoriesClient } from "./CategoriesClient";

export const metadata: Metadata = { title: "Job Categories" };

export default function CategoriesPage() {
  return <CategoriesClient initialCategories={jobCategories} />;
}
