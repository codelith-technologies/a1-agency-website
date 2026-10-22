"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { PageHeader, ActionButton, Badge } from "@/components/admin/ui";
import { FAQModal } from "@/components/admin/forms/FAQModal";
import type { FAQFormValues } from "@/lib/schemas";

interface FAQsClientProps {
  initialFaqs: any[];
}

export function FAQsClient({ initialFaqs }: FAQsClientProps) {
  const [faqs, setFaqs] = useState<any[]>(initialFaqs);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQFormValues | null>(null);

  const handleEdit = (item: any) => {
    setEditingFaq({
      id: item.id,
      question: item.question,
      answer: item.answer,
      category: item.category || "General",
      order: item.order || 1,
    });
    setModalOpen(true);
  };

  const handleSave = (saved: FAQFormValues) => {
    setFaqs((prev) => {
      const idx = prev.findIndex((item) => item.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          question: saved.question,
          answer: saved.answer,
          category: saved.category,
        };
        return next;
      }
      return [saved, ...prev];
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Frequently Asked Questions"
        description="Manage FAQs displayed on the public /faq page. Drag to reorder (after Supabase setup)."
      />

      <div className="rounded-xl border border-slate-200 bg-white shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Question</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Answer (preview)</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {faqs.map((faq, index) => (
                <tr key={faq.id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                  <td className="px-4 py-3 text-slate-400 text-xs">{faq.order ?? index + 1}</td>
                  <td className="px-4 py-3">
                    <Badge variant="blue">{faq.category}</Badge>
                  </td>
                  <td className="px-4 py-3 font-medium text-navy-800 max-w-xs">{faq.question}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs max-w-xs truncate">{faq.answer}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleEdit(faq)}
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

      <FAQModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        faq={editingFaq}
        onSave={handleSave}
      />
    </div>
  );
}
