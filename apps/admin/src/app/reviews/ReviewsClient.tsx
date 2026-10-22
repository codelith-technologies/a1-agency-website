"use client";

import { useState } from "react";
import { Plus, CheckCircle2, XCircle, Star } from "lucide-react";
import { PageHeader, ActionButton, Badge } from "@/components/admin/ui";
import { ReviewModal } from "@/components/admin/forms/ReviewModal";
import type { ReviewFormValues } from "@/lib/schemas";

interface ReviewsClientProps {
  initialReviews: any[];
}

export function ReviewsClient({ initialReviews }: ReviewsClientProps) {
  const [reviews, setReviews] = useState<any[]>(initialReviews);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewFormValues | null>(null);

  const handleEdit = (r: any) => {
    setEditingReview({
      id: r.id,
      reviewerName: r.type === "candidate" ? r.name : r.company,
      reviewText: r.review || "",
      rating: r.rating || 5,
      role: r.role || r.contactRole || "",
      country: r.destination || r.country || "",
      type: r.type || "candidate",
      verified: r.verified ?? true,
    });
    setModalOpen(true);
  };

  const handleSave = (saved: ReviewFormValues) => {
    setReviews((prev) => {
      const idx = prev.findIndex((item) => item.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        const existing = next[idx];
        next[idx] = {
          ...existing,
          name: existing.type === "candidate" ? saved.reviewerName : existing.name,
          company: existing.type === "employer" ? saved.reviewerName : existing.company,
          review: saved.reviewText,
          rating: saved.rating,
          role: saved.role || existing.role,
          destination: saved.country || existing.destination,
          verified: saved.verified,
        };
        return next;
      }
      return prev;
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reviews & Testimonials"
        description="Manage candidate and employer feedback. Only verified reviews appear on the public site."
      />

      <div className="rounded-xl border border-slate-200 bg-white shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Name / Company</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Rating</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Role / Country</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Review Text</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500">Verified</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                  <td className="px-4 py-3">
                    <Badge variant={r.type === "candidate" ? "blue" : "amber"}>
                      {r.type}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 font-medium text-navy-800">
                    {r.type === "candidate" ? r.name : r.company}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="size-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-semibold text-slate-700">{r.rating || 5}.0</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {r.type === "candidate"
                      ? `${r.role ?? "—"} · ${r.destination ?? ""}`
                      : r.country ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600 max-w-xs truncate text-xs">
                    {r.review}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {r.verified ? (
                      <CheckCircle2 className="mx-auto size-4 text-teal-500" />
                    ) : (
                      <XCircle className="mx-auto size-4 text-slate-300" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleEdit(r)}
                      className="text-xs font-semibold text-navy-600 hover:text-navy-900 hover:underline transition"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ReviewModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        review={editingReview}
        onSave={handleSave}
      />
    </div>
  );
}
