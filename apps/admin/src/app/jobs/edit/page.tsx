"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getAdminJob, type AdminJob } from "@a1/database";
import { JobForm } from "@/components/admin/jobs/JobForm";

function EditJobContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [job, setJob] = useState<AdminJob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let active = true;
    void getAdminJob(id).then((result) => {
      if (!active) return;
      setJob(result.job);
      setError(result.error);
      setLoading(false);
    });
    return () => { active = false; };
  }, [id]);

  if (!id) return (
    <section role="alert" className="rounded-xl border border-slate-200 bg-white p-6">
      <h1 className="text-xl font-semibold">Job unavailable</h1>
      <p className="mt-2 text-sm text-slate-600">A job ID is required.</p>
      <Link href="/jobs" className="mt-4 inline-block text-sm underline">Return to jobs</Link>
    </section>
  );
  if (loading) return <p role="status" className="text-sm text-slate-600">Loading job vacancy…</p>;
  if (error || !job) return (
    <section role="alert" className="rounded-xl border border-slate-200 bg-white p-6">
      <h1 className="text-xl font-semibold">Job unavailable</h1>
      <p className="mt-2 text-sm text-slate-600">{error ?? "Job not found."}</p>
      <Link href="/jobs" className="mt-4 inline-block text-sm underline">Return to jobs</Link>
    </section>
  );
  return <JobForm initialJob={job} />;
}

export default function EditJobPage() {
  return <Suspense fallback={<p role="status" className="text-sm text-slate-600">Loading job vacancy…</p>}><EditJobContent /></Suspense>;
}
