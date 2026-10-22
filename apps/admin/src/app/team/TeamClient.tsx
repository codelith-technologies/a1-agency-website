"use client";

import { useState } from "react";
import { Plus, User } from "lucide-react";
import { PageHeader, ActionButton, Badge } from "@/components/admin/ui";
import { TeamMemberModal } from "@/components/admin/forms/TeamMemberModal";
import type { TeamMemberFormValues } from "@/lib/schemas";

export function TeamClient() {
  const [teamMembers, setTeamMembers] = useState<TeamMemberFormValues[]>([
    {
      id: "team-1",
      name: "Deshabandu M. F. M. Farzan",
      role: "Managing Director / Prop.",
      imageUrl: "",
      bio: "Overseas recruitment specialist with over two decades of experience in Middle Eastern human resources.",
    },
    {
      id: "team-2",
      name: "Senior Operations Manager",
      role: "Operations & SLBFE Compliance",
      imageUrl: "",
      bio: "Handles embassy attestations, visa documentation, and SLBFE regulatory compliance.",
    },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMemberFormValues | null>(null);

  const handleAdd = () => {
    setEditingMember(null);
    setModalOpen(true);
  };

  const handleEdit = (m: TeamMemberFormValues) => {
    setEditingMember(m);
    setModalOpen(true);
  };

  const handleSave = (saved: TeamMemberFormValues) => {
    setTeamMembers((prev) => {
      const idx = prev.findIndex((item) => item.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team Members"
        description="Manage staff profiles displayed on the About Us page."
        action={
          <ActionButton onClick={handleAdd}>
            <Plus className="size-4" /> Add Team Member
          </ActionButton>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {teamMembers.length === 0 ? (
          <div className="col-span-full rounded-xl border-2 border-dashed border-slate-300 p-16 text-center">
            <User className="mx-auto mb-3 size-10 text-slate-300" />
            <p className="text-sm font-medium text-slate-500">No team members yet</p>
            <p className="mt-1 text-xs text-slate-400">Add staff profiles to display on the About Us page</p>
            <button
              onClick={handleAdd}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-navy-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-navy-700"
            >
              <Plus className="size-4" /> Add First Member
            </button>
          </div>
        ) : (
          teamMembers.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-card hover:border-slate-300 transition"
            >
              <div className="flex items-center gap-3">
                {m.imageUrl ? (
                  <img
                    src={m.imageUrl}
                    alt={m.name}
                    className="size-10 rounded-full object-cover border border-slate-200"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="flex size-10 items-center justify-center rounded-full bg-navy-100 text-navy-600 font-semibold text-xs">
                    {m.name.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="font-medium text-navy-800 line-clamp-1">{m.name}</p>
                  <p className="text-xs text-slate-400 line-clamp-1">{m.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleEdit(m)}
                  className="text-xs font-semibold text-navy-600 hover:text-navy-900 hover:underline transition"
                >
                  Edit
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <TeamMemberModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        member={editingMember}
        onSave={handleSave}
      />
    </div>
  );
}
