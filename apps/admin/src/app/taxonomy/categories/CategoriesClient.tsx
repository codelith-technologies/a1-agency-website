"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { PageHeader, ActionButton, Badge } from "@/components/admin/ui";
import { CategoryModal } from "@/components/admin/forms/CategoryModal";
import type { CategoryFormValues } from "@/lib/schemas";

interface CategoriesClientProps {
  initialCategories: any[];
}

export function CategoriesClient({ initialCategories }: CategoriesClientProps) {
  const [categories, setCategories] = useState<any[]>(initialCategories);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryFormValues | null>(null);

  const handleAdd = () => {
    setEditingCategory(null);
    setModalOpen(true);
  };

  const handleEdit = (cat: any) => {
    setEditingCategory({
      id: cat.id,
      name: cat.name,
      description: cat.description || "",
      slug: cat.slug || "",
      icon: cat.icon || "Briefcase",
      jobCount: cat.jobCount || 0,
      agencyConfirmed: cat.agencyConfirmed ?? true,
    });
    setModalOpen(true);
  };

  const handleSave = (saved: CategoryFormValues) => {
    setCategories((prev) => {
      const idx = prev.findIndex((item) => item.id === saved.id || item.slug === saved.slug);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          name: saved.name,
          description: saved.description,
          slug: saved.slug || next[idx].slug,
          icon: saved.icon || next[idx].icon,
          agencyConfirmed: saved.agencyConfirmed,
        };
        return next;
      }
      return [
        {
          id: saved.id || saved.slug,
          name: saved.name,
          description: saved.description,
          slug: saved.slug,
          icon: saved.icon || "Briefcase",
          jobCount: 0,
          agencyConfirmed: saved.agencyConfirmed,
        },
        ...prev,
      ];
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Job Categories"
        description="Manage the job category taxonomy used across vacancies and country pages."
        action={
          <ActionButton onClick={handleAdd}>
            <Plus className="size-4" /> Add Category
          </ActionButton>
        }
      />

      <div className="rounded-xl border border-slate-200 bg-white shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Slug</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Icon</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Description</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500">Active Jobs</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500">Confirmed</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id || cat.slug} className="border-b border-slate-50 hover:bg-slate-50 transition">
                  <td className="px-4 py-3 font-medium text-navy-800">{cat.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{cat.slug}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{cat.icon}</td>
                  <td className="px-4 py-3 text-slate-600 max-w-xs truncate">{cat.description}</td>
                  <td className="px-4 py-3 text-center text-slate-700">{cat.jobCount ?? 0}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={cat.agencyConfirmed ? "green" : "slate"}>
                      {cat.agencyConfirmed ? "Yes" : "No"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleEdit(cat)}
                      className="text-xs font-semibold text-navy-600 hover:text-navy-900 hover:underline transition"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}

              {categories.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-sm text-slate-400">
                    No categories found.{" "}
                    <button onClick={handleAdd} className="text-navy-600 underline font-medium">
                      Add one →
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CategoryModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        category={editingCategory}
        onSave={handleSave}
      />
    </div>
  );
}
