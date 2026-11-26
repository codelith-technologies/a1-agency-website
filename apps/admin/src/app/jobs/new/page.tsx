import type { Metadata } from "next";
import { JobForm } from "@/components/admin/jobs/JobForm";

export const metadata: Metadata = { title: "Post New Job" };

export default function NewJobPage() {
  return <JobForm />;
}
