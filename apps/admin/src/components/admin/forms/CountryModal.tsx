"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Modal } from "@/components/admin/ui/Modal";
import { Field, Input, Select, ActionButton } from "@/components/admin/ui";
import { ImageUpload } from "@/components/admin/ui/ImageUpload";
import { countrySchema, type CountryFormValues } from "@/lib/schemas";
import { saveCountryAction, uploadImageToStorage } from "@/lib/actions";

interface CountryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  country?: CountryFormValues | null;
  onSave: (savedCountry: CountryFormValues) => void;
}

export function CountryModal({
  open,
  onOpenChange,
  country,
  onSave,
}: CountryModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CountryFormValues>({
    resolver: zodResolver(countrySchema),
    defaultValues: {
      name: "",
      region: "Middle East",
      flag: "",
      summary: "",
      imageUrl: "",
      active: true,
    },
  });

  const isEdit = Boolean(country?.id);

  useEffect(() => {
    if (country) {
      reset(country);
    } else {
      reset({
        name: "",
        region: "Middle East",
        flag: "",
        summary: "",
        imageUrl: "",
        active: true,
      });
      setSelectedFile(null);
    }
    setServerError(null);
  }, [country, reset, open]);

  const onSubmit = async (data: CountryFormValues) => {
    setServerError(null);
    try {
      let finalImageUrl = data.imageUrl;

      // Upload newly replaced/selected image to Storage bucket
      if (selectedFile) {
        const uploadRes = await uploadImageToStorage(selectedFile, "flags");
        if (uploadRes.success && uploadRes.url) {
          finalImageUrl = uploadRes.url;
        }
      }

      const payload: CountryFormValues = {
        ...data,
        imageUrl: finalImageUrl,
        id: country?.id || data.name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      };

      const res = await saveCountryAction(payload);
      if (!res.success) {
        setServerError(res.error || "Failed to save country.");
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
      title={isEdit ? `Edit Country: ${country?.name}` : "Add New Country"}
      description="Configure destination country information and visual media for candidate recruitment."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {serverError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600">
            {serverError}
          </div>
        )}

        <Field id="name" label="Country Name" required error={errors.name?.message}>
          <Input id="name" placeholder="e.g. Saudi Arabia, Romania" {...register("name")} />
        </Field>

        <Field id="region" label="Region" required error={errors.region?.message}>
          <Select
            id="region"
            {...register("region")}
            options={[
              { value: "Middle East", label: "Middle East" },
              { value: "Southeast Asia", label: "Southeast Asia" },
              { value: "Europe", label: "Europe" },
              { value: "East Asia", label: "East Asia" },
              { value: "Other", label: "Other" },
            ]}
          />
        </Field>

        {/* Image Upload Component for Country Flag / Photo */}
        <ImageUpload
          label="Country Flag or Destination Cover Photo"
          value={watch("imageUrl")}
          aspectRatio="flag"
          onChange={(file, previewUrl) => {
            setSelectedFile(file);
            setValue("imageUrl", previewUrl || "");
          }}
          hint="Upload official flag SVG/PNG or high-resolution destination photo"
        />

        <div className="flex items-center gap-2 pt-1">
          <input
            id="active"
            type="checkbox"
            className="size-4 rounded border-slate-300 text-navy-800 focus:ring-navy-500"
            {...register("active")}
          />
          <label htmlFor="active" className="text-xs font-medium text-slate-700">
            Active for candidate applications & displayed on public site
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
            {isEdit ? "Update Country" : "Create Country"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
