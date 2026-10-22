"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Modal } from "@/components/admin/ui/Modal";
import { Field, Input, Textarea, Select, ActionButton } from "@/components/admin/ui";
import { announcementSchema, type AnnouncementFormValues } from "@/lib/schemas";
import { saveAnnouncementAction } from "@/lib/actions";

interface AnnouncementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (savedAnnouncement: AnnouncementFormValues) => void;
}

export function AnnouncementModal({
  open,
  onOpenChange,
  onSave,
}: AnnouncementModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: "",
      content: "",
      priority: "medium",
      audience: "all",
      expiryDate: "",
      active: true,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        title: "",
        content: "",
        priority: "medium",
        audience: "all",
        expiryDate: "",
        active: true,
      });
      setServerError(null);
    }
  }, [open, reset]);

  const onSubmit = async (data: AnnouncementFormValues) => {
    setServerError(null);
    try {
      const payload: AnnouncementFormValues = {
        ...data,
        id: `announcement-${Date.now()}`,
      };

      const res = await saveAnnouncementAction(payload);
      if (!res.success) {
        setServerError(res.error || "Failed to create announcement.");
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
      title="Create New Announcement"
      description="Broadcast important recruitment alerts, walk-in interview notices, or regulatory updates."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {serverError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600">
            {serverError}
          </div>
        )}

        <Field id="title" label="Announcement Title" required error={errors.title?.message}>
          <Input id="title" placeholder="e.g. Urgent Walk-In Interviews for Dubai Hospitality" {...register("title")} />
        </Field>

        <Field id="content" label="Content / Message" required error={errors.content?.message}>
          <Textarea
            id="content"
            rows={4}
            placeholder="Provide full details, required documents, timing, and venue information..."
            {...register("content")}
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field id="priority" label="Priority Level" error={errors.priority?.message}>
            <Select
              id="priority"
              {...register("priority")}
              options={[
                { value: "low", label: "Low" },
                { value: "medium", label: "Medium (Standard)" },
                { value: "high", label: "High" },
                { value: "urgent", label: "Urgent (Red Alert)" },
              ]}
            />
          </Field>

          <Field id="audience" label="Target Audience" error={errors.audience?.message}>
            <Select
              id="audience"
              {...register("audience")}
              options={[
                { value: "all", label: "Everyone" },
                { value: "candidates", label: "Job Seekers" },
                { value: "employers", label: "Employers" },
              ]}
            />
          </Field>

          <Field id="expiryDate" label="Expiry Date (optional)" hint="Automatic take-down date" error={errors.expiryDate?.message}>
            <Input id="expiryDate" type="date" {...register("expiryDate")} />
          </Field>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            id="active"
            type="checkbox"
            className="size-4 rounded border-slate-300 text-navy-800 focus:ring-navy-500"
            {...register("active")}
          />
          <label htmlFor="active" className="text-xs font-medium text-slate-700">
            Publish immediately to public notice board
          </label>
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
            Publish Announcement
          </button>
        </div>
      </form>
    </Modal>
  );
}
