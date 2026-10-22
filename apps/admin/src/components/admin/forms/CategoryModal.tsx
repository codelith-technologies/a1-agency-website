"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Modal } from "@/components/admin/ui/Modal";
import { Field, Input, Textarea, ActionButton } from "@/components/admin/ui";
import { categorySchema, type CategoryFormValues } from "@/lib/schemas";
import { saveCategoryAction } from "@/lib/actions";

interface CategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: CategoryFormValues | null;
  onSave: (savedCategory: CategoryFormValues) => void;
}

export function CategoryModal({
  open,
  onOpenChange,
  category,
  onSave,
}: CategoryModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
      slug: "",
      icon: "Briefcase",
      jobCount: 0,
      agencyConfirmed: true,
    },
  });

  const isEdit = Boolean(category?.id);

  useEffect(() => {
    if (category) {
      reset(category);
    } else {
      reset({
        name: "",
        description: "",
        slug: "",
        icon: "Briefcase",
        jobCount: 0,
        agencyConfirmed: true,
      });
    }
    setServerError(null);
  }, [category, reset, open]);

  const onSubmit = async (data: CategoryFormValues) => {
    setServerError(null);
    try {
      const payload: CategoryFormValues = {
        ...data,
        id: category?.id || data.slug || data.name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
        slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      };

      const res = await saveCategoryAction(payload);
      if (!res.success) {
        setServerError(res.error || "Failed to save category.");
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
      title={isEdit ? `Edit Category: ${category?.name}` : "Add Job Category"}
      description="Manage the category definition, scope, and descriptions used across job listings."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {serverError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600">
            {serverError}
          </div>
        )}

        <Field id="name" label="Category Name" required error={errors.name?.message}>
          <Input id="name" placeholder="e.g. Heavy Vehicle Driving, Hospitality" {...register("name")} />
        </Field>

        <Field id="description" label="Description" required error={errors.description?.message}>
          <Textarea
            id="description"
            rows={4}
            placeholder="Detailed description of the roles and specializations in this category..."
            {...register("description")}
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field id="slug" label="Slug (optional)" hint="URL slug (auto-generated if empty)" error={errors.slug?.message}>
            <Input id="slug" placeholder="e.g. driving-transport" {...register("slug")} />
          </Field>

          <Field id="icon" label="Icon Key" hint="Lucide icon identifier" error={errors.icon?.message}>
            <Input id="icon" placeholder="e.g. Truck, Utensils, Wrench" {...register("icon")} />
          </Field>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            id="agencyConfirmed"
            type="checkbox"
            className="size-4 rounded border-slate-300 text-navy-800 focus:ring-navy-500"
            {...register("agencyConfirmed")}
          />
          <label htmlFor="agencyConfirmed" className="text-xs font-medium text-slate-700">
            Agency Confirmed (Verified specialization)
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
            {isEdit ? "Save Changes" : "Create Category"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
