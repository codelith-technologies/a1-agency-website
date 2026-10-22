"use client";

import { useState } from "react";
import { Plus, Calendar, MapPin, Image as ImageIcon } from "lucide-react";
import { PageHeader, ActionButton } from "@/components/admin/ui";
import { EventModal } from "@/components/admin/forms/EventModal";
import type { EventFormValues } from "@/lib/schemas";

export function EventsClient() {
  const [events, setEvents] = useState<EventFormValues[]>([
    {
      id: "event-sample-1",
      topic: "Gulf Hospitality & Tourism Recruitment Seminar",
      description: "Comprehensive orientation program for candidates selected for luxury hotel chains in Dubai and Doha.",
      imageUrl: "/images/hero-bg.webp",
      date: new Date(Date.now() + 86400000 * 5).toISOString().split("T")[0],
      location: "Grand Ballroom, Colombo",
    },
  ]);
  const [modalOpen, setModalOpen] = useState(false);

  const handleCreate = () => {
    setModalOpen(true);
  };

  const handleSave = (saved: EventFormValues) => {
    setEvents((prev) => [saved, ...prev]);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Events Management"
        description="Create and manage recruitment drives, walk-in interview days, and agency events."
        action={
          <ActionButton onClick={handleCreate}>
            <Plus className="size-4" /> New Event
          </ActionButton>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((evt) => (
          <div
            key={evt.id}
            className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card hover:border-slate-300 transition"
          >
            {evt.imageUrl ? (
              <div className="aspect-video w-full overflow-hidden bg-slate-100">
                <img
                  src={evt.imageUrl}
                  alt={evt.topic}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              </div>
            ) : (
              <div className="aspect-video w-full flex items-center justify-center bg-slate-100 text-slate-400">
                <ImageIcon className="size-8" />
              </div>
            )}
            <div className="flex flex-1 flex-col p-4">
              <h3 className="font-semibold text-navy-900 line-clamp-1">{evt.topic}</h3>
              <p className="mt-1 text-xs text-slate-500 line-clamp-2">{evt.description}</p>
              
              <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-3 text-[11px] text-slate-500">
                {evt.date && (
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3.5 text-navy-600" />
                    {evt.date}
                  </span>
                )}
                {evt.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3.5 text-navy-600" />
                    {evt.location}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {events.length === 0 && (
          <div className="col-span-full rounded-xl border-2 border-dashed border-slate-300 p-16 text-center">
            <p className="text-sm font-medium text-slate-500">No events yet</p>
            <p className="mt-1 text-xs text-slate-400">Add recruitment drives, interview days, and agency events</p>
            <button
              onClick={handleCreate}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-navy-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-navy-700"
            >
              <Plus className="size-4" /> Create First Event
            </button>
          </div>
        )}
      </div>

      <EventModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSave={handleSave}
      />
    </div>
  );
}
