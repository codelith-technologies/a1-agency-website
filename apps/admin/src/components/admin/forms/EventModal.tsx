"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Modal } from "@/components/admin/ui/Modal";
import { Field, Input, Textarea, ActionButton } from "@/components/admin/ui";
import { ImageUpload } from "@/components/admin/ui/ImageUpload";
import { eventSchema, type EventFormValues } from "@/lib/schemas";
import { saveEventAction, uploadImageToStorage } from "@/lib/actions";

interface EventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (savedEvent: EventFormValues) => void;
}

export function EventModal({
  open,
  onOpenChange,
  onSave,
}: EventModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      topic: "",
      description: "",
      imageUrl: "",
      date: new Date().toISOString().split("T")[0],
      location: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        topic: "",
        description: "",
        imageUrl: "",
        date: new Date().toISOString().split("T")[0],
        location: "",
      });
      setSelectedFile(null);
      setServerError(null);
    }
  }, [open, reset]);

  const onSubmit = async (data: EventFormValues) => {
    setServerError(null);
    try {
      let finalImageUrl = data.imageUrl;

      // Upload image to Storage bucket placeholder
      if (selectedFile) {
        const uploadRes = await uploadImageToStorage(selectedFile, "events");
        if (uploadRes.success && uploadRes.url) {
          finalImageUrl = uploadRes.url;
        }
      }

      const payload: EventFormValues = {
        ...data,
        imageUrl: finalImageUrl,
        id: `event-${Date.now()}`,
      };

      const res = await saveEventAction(payload);
      if (!res.success) {
        setServerError(res.error || "Failed to create event.");
        return;
      }

      onSave(payload);
      onOpenChange(false);
    } catch (err: any) {
      setServerError(err.message || "An unexpected error occurred.");
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Create New Event"
      description="Publish recruitment drives, walk-in interview sessions, and agency milestone events."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {serverError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600">
            {serverError}
          </div>
        )}

        {/* 1. Event Topic (title) */}
        <Field id="topic" label="Event Topic (Title)" required error={errors.topic?.message}>
          <Input id="topic" placeholder="e.g. Dubai Hospitality Mega Recruitment Drive 2026" {...register("topic")} />
        </Field>

        {/* 2. Description */}
        <Field id="description" label="Description" required error={errors.description?.message}>
          <Textarea
            id="description"
            rows={4}
            placeholder="Event itinerary, open positions, prerequisites, candidate documents to bring..."
            {...register("description")}
          />
        </Field>

        {/* 3. Image Upload Component */}
        <ImageUpload
          label="Event Banner / Promotional Photo"
          value={watch("imageUrl")}
          aspectRatio="video"
          onChange={(file, previewUrl) => {
            setSelectedFile(file);
            setValue("imageUrl", previewUrl || "");
          }}
          hint="High-resolution poster, banner or event gallery photo"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field id="date" label="Event Date" error={errors.date?.message}>
            <Input id="date" type="date" {...register("date")} />
          </Field>

          <Field id="location" label="Venue / Location (optional)" error={errors.location?.message}>
            <Input id="location" placeholder="e.g. A-One Head Office, Colombo 03" {...register("location")} />
          </Field>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
          <ActionButton
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </ActionButton>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-lg bg-navy-800 px-4 py-2 text-sm font-medium text-white hover:bg-navy-700 disabled:opacity-50 transition"
          >
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            Create Event
          </button>
        </div>
      </form>
    </Modal>
  );
}
