"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { listAdminJobOptions, listAdminJobs, updateAdminJob, type AdminJob, type JobPayload } from "@a1/database";
import { PageHeader, Badge, ActionButton } from "@/components/admin/ui";

const statusVariant: Record<string, "green" | "yellow" | "red" | "slate"> = {
  published: "green",
  draft: "slate",
  closed: "red",
  archived: "yellow",
};

function formatLkr(value: number | null) {
  if (value == null) return "Not specified";
  return new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR", maximumFractionDigits: 0 }).format(value);
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [countries, setCountries] = useState<{ id: string; name: string }[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");

  const reload = async () => {
    setLoading(true);
    setError(null);
    const [jobResult, optionResult] = await Promise.all([listAdminJobs(), listAdminJobOptions()]);
    setJobs(jobResult.jobs);
    setCountries(optionResult.countries);
    setCategories(optionResult.categories);
    setError(jobResult.error ?? optionResult.error);
    setLoading(false);
  };

  useEffect(() => {
    let active = true;
    void Promise.all([listAdminJobs(), listAdminJobOptions()]).then(([jobResult, optionResult]) => {
      if (!active) return;
      setJobs(jobResult.jobs);
      setCountries(optionResult.countries);
      setCategories(optionResult.categories);
      setError(jobResult.error ?? optionResult.error);
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => jobs.filter(job => {
    const term = search.trim().toLowerCase();
    const matchesSearch = !term || job.title.toLowerCase().includes(term) || job.reference.toLowerCase().includes(term);
    return matchesSearch
      && (!country || job.country_id === country)
      && (!category || job.category_id === category)
      && (!status || job.status === status);
  }), [jobs, search, country, category, status]);

  const changeStatus = async (job: AdminJob, nextStatus: "closed" | "archived") => {
    const label = nextStatus === "closed" ? "close" : "archive";
    if (!window.confirm(`Are you sure you want to ${label} "${job.title}"?`)) return;
    const payload: Partial<JobPayload> = nextStatus === "closed"
      ? { status: "closed" }
      : { status: "archived" };
    const result = await updateAdminJob(job.id, job.updated_at, payload);
    if (result.error) setError(result.error);
    else await reload();
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Job Vacancies" description="Manage internal job postings and recruitment status." action={<ActionButton href="/jobs/new"><Plus className="size-4" /> New Job</ActionButton>} />
      {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error} <button type="button" onClick={() => void reload()} className="ml-2 underline">Retry</button></div>}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-card">
        <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-slate-300 px-3 py-2">
          <Search className="size-4 text-slate-400" />
          <input value={search} onChange={event => setSearch(event.target.value)} type="search" placeholder="Search title or reference…" className="flex-1 text-sm outline-none" />
        </div>
        <select value={country} onChange={event => setCountry(event.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm"><option value="">All Countries</option>{countries.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
        <select value={category} onChange={event => setCategory(event.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm"><option value="">All Categories</option>{categories.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
        <select value={status} onChange={event => setStatus(event.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm"><option value="">All Statuses</option><option value="draft">Draft</option><option value="published">Published</option><option value="closed">Closed</option><option value="archived">Archived</option></select>
        <button type="button" onClick={() => { setSearch(""); setCountry(""); setCategory(""); setStatus(""); }} className="text-sm text-slate-500 underline">Clear filters</button>
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-slate-100 bg-slate-50">{["Reference","Title","Destination","Category","Vacancies","Salary","Age","Status","Closing","Actions"].map(label => <th key={label} className="px-4 py-3 text-left text-xs font-semibold text-slate-500">{label}</th>)}</tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={10} className="px-4 py-12 text-center text-slate-400">Loading vacancies…</td></tr> : filtered.length === 0 ? <tr><td colSpan={10} className="px-4 py-12 text-center text-slate-400">{jobs.length ? "No jobs match the selected filters." : "No job vacancies yet."} <Link href="/jobs/new" className="ml-1 font-medium text-navy-600 underline">Create one</Link></td></tr> : filtered.map(job => (
              <tr key={job.id} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-xs">{job.reference}</td>
                <td className="px-4 py-3 font-medium text-navy-800">{job.featured && <span className="mr-1 text-amber-500">★</span>}{job.title}</td>
                <td className="px-4 py-3">{job.country?.name ?? "Unknown"}</td>
                <td className="px-4 py-3">{job.category?.name ?? "Unknown"}</td>
                <td className="px-4 py-3">{job.vacancy_count}</td>
                <td className="px-4 py-3">{formatLkr(job.salary_min)}{job.salary_max != null ? ` – ${formatLkr(job.salary_max)}` : ""}</td>
                <td className="px-4 py-3">{job.minimum_age ?? "–"}–{job.maximum_age ?? "–"}</td>
                <td className="px-4 py-3"><Badge variant={statusVariant[job.status] ?? "slate"}>{job.status}</Badge></td>
                <td className="px-4 py-3">{job.closing_date ?? "Not set"}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/jobs/edit?id=${encodeURIComponent(job.id)}`} className="text-xs font-medium text-navy-600 underline">Edit</Link>
                    {job.status !== "closed" && job.status !== "archived" && <button type="button" onClick={() => void changeStatus(job, "closed")} className="text-xs text-red-600 underline">Close</button>}
                    {job.status !== "archived" && <button type="button" onClick={() => void changeStatus(job, "archived")} className="text-xs text-slate-600 underline">Archive</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
        Publication is currently blocked: the public website uses build-time demo job routes and cannot safely expose database-created job details yet.
      </div>
    </div>
  );
}
