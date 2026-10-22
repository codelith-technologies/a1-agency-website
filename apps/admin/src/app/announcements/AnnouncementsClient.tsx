"use client";

import { useState } from "react";
import { Plus, Bell } from "lucide-react";
import { PageHeader, ActionButton, Badge } from "@/components/admin/ui";
import { AnnouncementModal } from "@/components/admin/forms/AnnouncementModal";
import type { AnnouncementFormValues } from "@/lib/schemas";

const priorityVariant = {
  low: "slate" as const,
  medium: "blue" as const,
  high: "amber" as const,
  urgent: "red" as const,
};

export function AnnouncementsClient() {
  const [announcements, setAnnouncements] = useState<AnnouncementFormValues[]>([
    {
      id: "announcement-demo-1",
      title: "Urgent Gulf Hospitality Walk-In Interviews This Saturday",
      content: "A-One is hosting face-to-face client interviews for five-star hotel positions in Dubai and Qatar. Bring updated CV, certificates, and passport copy.",
      priority: "high",
      audience: "candidates",
      expiryDate: new Date(Date.now() + 86400000 * 7).toISOString().split("T")[0],
      active: true,
    },
  ]);
  const [modalOpen, setModalOpen] = useState(false);

  const handleCreate = () => {
    setModalOpen(true);
  };

  const handleSave = (saved: AnnouncementFormValues) => {
    setAnnouncements((prev) => [saved, ...prev]);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Announcements / Notice Board"
        description="Broadcast urgent alerts, job interview notices, and news to candidates and employers on the public site."
        action={
          <ActionButton onClick={handleCreate}>
            <Plus className="size-4" /> New Announcement
          </ActionButton>
        }
      />

      <div className="rounded-xl border border-slate-200 bg-white shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Priority</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Audience</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Message (preview)</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Expires</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500">Active</th>
              </tr>
            </thead>
            <tbody>
              {announcements.map((item) => (
                <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                  <td className="px-4 py-3 font-medium text-navy-800">{item.title}</td>
                  <td className="px-4 py-3">
                    <Badge variant={priorityVariant[item.priority] || "slate"}>
                      {item.priority.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs capitalize text-slate-600">{item.audience}</td>
                  <td className="px-4 py-3 text-xs text-slate-500 max-w-xs truncate">{item.content}</td>
                  <td className="px-4 py-3 text-xs text-slate-500 font-mono">
                    {item.expiryDate || "No Expiry"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block h-2 w-2 rounded-full ${
                        item.active ? "bg-teal-400" : "bg-slate-300"
                      }`}
                    />
                  </td>
                </tr>
              ))}

              {announcements.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-400">
                    No announcements yet.{" "}
                    <button
                      onClick={handleCreate}
                      className="font-medium text-navy-600 underline"
                    >
                      Create one →
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnnouncementModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSave={handleSave}
      />
    </div>
  );
}
