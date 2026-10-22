"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Modal } from "@/components/admin/ui/Modal";
import { Field, Input, Textarea, Select, ActionButton } from "@/components/admin/ui";
import { faqSchema, type FAQFormValues } from "@/lib/schemas";
import { saveFAQAction } from "@/lib/actions";

interface FAQModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  faq?: FAQFormValues | null;
  onSave: (savedFAQ: FAQFormValues) => void;
}

export function FAQModal({
  open,
  onOpenChange,
  faq,
  onSave,
}: FAQModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FAQFormValues>({
    resolver: zodResolver(faqSchema),
    defaultValues: {
      question: "",
      answer: "",
      category: "Recruitment Process",
      order: 1,
    },
  });

  const isEdit = Boolean(faq?.id);

  useEffect(() => {
    if (faq) {
      reset(faq);
    } else {
      reset({
        question: "",
        answer: "",
        category: "Recruitment Process",
        order: 1,
      });
    }
    setServerError(null);
  }, [faq, reset, open]);

  const onSubmit = async (data: FAQFormValues) => {
    setServerError(null);
    try {
      const payload: FAQFormValues = {
        ...data,
        id: faq?.id || `faq-${Date.now()}`,
      };

      const res = await saveFAQAction(payload);
      if (!res.success) {
        setServerError(res.error || "Failed to save FAQ.");
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
      title={isEdit ? "Edit Frequently Asked Question" : "Add FAQ"}
      description="Update the question and answer content displayed on the public FAQ page."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {serverError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600">
            {serverError}
          </div>
        )}

        <Field id="category" label="Category" required error={errors.category?.message}>
          <Select
            id="category"
            {...register("category")}
            options={[
              { value: "Recruitment Process", label: "Recruitment Process" },
              { value: "Documentation & Visas", label: "Documentation & Visas" },
              { value: "Medical & SLBFE", label: "Medical & SLBFE" },
              { value: "Employer Services", label: "Employer Services" },
              { value: "General", label: "General" },
            ]}
          />
        </Field>

        <Field id="question" label="Question" required error={errors.question?.message}>
          <Input id="question" placeholder="e.g. What documents are required for Gulf visa processing?" {...register("question")} />
        </Field>

        <Field id="answer" label="Answer" required error={errors.answer?.message}>
          <Textarea
            id="answer"
            rows={5}
            placeholder="Comprehensive answer explaining the procedure, timelines, and guidelines..."
            {...register("answer")}
          />
        </Field>

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
            {isEdit ? "Update FAQ" : "Save FAQ"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
