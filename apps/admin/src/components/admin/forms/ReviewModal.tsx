"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Star } from "lucide-react";
import { Modal } from "@/components/admin/ui/Modal";
import { Field, Input, Textarea, ActionButton } from "@/components/admin/ui";
import { reviewSchema, type ReviewFormValues } from "@/lib/schemas";
import { saveReviewAction } from "@/lib/actions";
import { cn } from "@/lib/utils";

interface ReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  review?: ReviewFormValues | null;
  onSave: (savedReview: ReviewFormValues) => void;
}

export function ReviewModal({
  open,
  onOpenChange,
  review,
  onSave,
}: ReviewModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      reviewerName: "",
      reviewText: "",
      rating: 5,
      role: "",
      country: "",
      type: "candidate",
      verified: true,
    },
  });

  const rating = watch("rating") || 5;

  useEffect(() => {
    if (review) {
      reset({
        ...review,
        rating: review.rating || 5,
      });
    }
    setServerError(null);
  }, [review, reset, open]);

  const onSubmit = async (data: ReviewFormValues) => {
    setServerError(null);
    try {
      const payload: ReviewFormValues = {
        ...data,
        id: review?.id,
      };

      const res = await saveReviewAction(payload);
      if (!res.success) {
        setServerError(res.error || "Failed to update review.");
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
      title="Edit Review / Testimonial"
      description="Modify candidate or employer feedback, review text, and star rating."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {serverError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600">
            {serverError}
          </div>
        )}

        <Field id="reviewerName" label="Reviewer Name / Company" required error={errors.reviewerName?.message}>
          <Input id="reviewerName" placeholder="e.g. Ruwan Silva or Al-Futtaim Group" {...register("reviewerName")} />
        </Field>

        {/* Rating Stars Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700">Rating (1 to 5 Stars)</label>
          <div className="flex items-center gap-1.5 py-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setValue("rating", star, { shouldValidate: true })}
                className="p-1 rounded hover:bg-slate-100 transition focus:outline-none"
              >
                <Star
                  className={cn(
                    "size-6 transition-colors",
                    star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"
                  )}
                />
              </button>
            ))}
            <span className="ml-2 text-xs font-semibold text-slate-700">{rating} out of 5 stars</span>
          </div>
          {errors.rating && <p className="text-[11px] text-red-500">{errors.rating.message}</p>}
        </div>

        <Field id="reviewText" label="Review / Testimonial Text" required error={errors.reviewText?.message}>
          <Textarea
            id="reviewText"
            rows={4}
            placeholder="Feedback regarding the agency's overseas recruitment service..."
            {...register("reviewText")}
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field id="role" label="Role / Designation" error={errors.role?.message}>
            <Input id="role" placeholder="e.g. Heavy Driver, HR Specialist" {...register("role")} />
          </Field>

          <Field id="country" label="Destination / Country" error={errors.country?.message}>
            <Input id="country" placeholder="e.g. Saudi Arabia, UAE, Qatar" {...register("country")} />
          </Field>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            id="verified"
            type="checkbox"
            className="size-4 rounded border-slate-300 text-navy-800 focus:ring-navy-500"
            {...register("verified")}
          />
          <label htmlFor="verified" className="text-xs font-medium text-slate-700">
            Verified review (eligible for public display on website)
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
            Save Review Changes
          </button>
        </div>
      </form>
    </Modal>
  );
}
