"use client";

import Link from "next/link";
import { ArrowLeft, Upload } from "lucide-react";

export default function MediaUploadPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/media" className="text-slate-400 transition hover:text-navy-700">
          <ArrowLeft className="size-5" />
          <span className="sr-only">Back to Media Gallery</span>
        </Link>
        <h1 className="text-xl font-bold text-navy-900">Upload Media</h1>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-card">
        <Upload className="mx-auto size-10 text-slate-300" />
        <p className="mt-4 text-sm font-medium text-slate-700">Media upload is not available yet.</p>
        <p className="mt-1 text-xs text-slate-500">Storage integration will be completed in a later phase.</p>
        <Link
          href="/media"
          className="mt-5 inline-flex rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-navy-300"
        >
          Return to Media Gallery
        </Link>
      </section>
    </div>
  );
}
