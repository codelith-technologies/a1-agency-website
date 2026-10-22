"use client";

import { useState } from "react";
import { Plus, Globe } from "lucide-react";
import { PageHeader, ActionButton } from "@/components/admin/ui";
import { CountryModal } from "@/components/admin/forms/CountryModal";
import type { CountryFormValues } from "@/lib/schemas";

interface CountriesClientProps {
  initialCountries: any[];
}

export function CountriesClient({ initialCountries }: CountriesClientProps) {
  const [countries, setCountries] = useState<any[]>(initialCountries);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState<CountryFormValues | null>(null);

  const handleAdd = () => {
    setEditingCountry(null);
    setModalOpen(true);
  };

  const handleEdit = (c: any) => {
    setEditingCountry({
      id: c.id,
      name: c.name,
      region: c.region || "Middle East",
      flag: c.flag || "",
      summary: c.summary || "",
      imageUrl: c.image || c.imageUrl || "",
      active: c.active ?? true,
    });
    setModalOpen(true);
  };

  const handleSave = (saved: CountryFormValues) => {
    setCountries((prev) => {
      const idx = prev.findIndex((item) => item.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          name: saved.name,
          region: saved.region,
          flag: saved.flag || next[idx].flag || "🌐",
          image: saved.imageUrl || next[idx].image,
          active: saved.active,
        };
        return next;
      }
      return [
        {
          id: saved.id,
          name: saved.name,
          region: saved.region,
          flag: saved.flag || "🌐",
          image: saved.imageUrl || "/images/countries/placeholders/global-market.svg",
          active: saved.active,
        },
        ...prev,
      ];
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Destination Countries"
        description="Manage destination country pages shown on the public site."
        action={
          <ActionButton onClick={handleAdd}>
            <Plus className="size-4" /> Add Country
          </ActionButton>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {countries.map((c) => (
          <div
            key={c.id}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-card hover:border-slate-300 transition"
          >
            <div className="flex items-center gap-3">
              {c.image ? (
                <img
                  src={c.image}
                  alt={c.name}
                  className="h-10 w-12 rounded object-cover border border-slate-100"
                  onError={(e) => {
                    // Fallback to emoji or icon if broken URL
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              ) : null}
              {!c.image && <span className="text-2xl">{c.flag || "🌐"}</span>}
              <div>
                <p className="font-medium text-navy-800">{c.name}</p>
                <p className="text-xs text-slate-400">{c.region}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-block h-2 w-2 rounded-full ${
                  c.active ? "bg-teal-400" : "bg-slate-300"
                }`}
                title={c.active ? "Active" : "Inactive"}
              />
              <button
                type="button"
                onClick={() => handleEdit(c)}
                className="text-xs font-semibold text-navy-600 hover:text-navy-900 hover:underline transition px-1 py-0.5"
              >
                Edit
              </button>
            </div>
          </div>
        ))}

        {countries.length === 0 && (
          <p className="col-span-full text-center py-12 text-sm text-slate-400">
            No countries yet.{" "}
            <button
              onClick={handleAdd}
              className="text-navy-600 underline font-medium"
            >
              Add one →
            </button>
          </p>
        )}
      </div>

      <CountryModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        country={editingCountry}
        onSave={handleSave}
      />
    </div>
  );
}
