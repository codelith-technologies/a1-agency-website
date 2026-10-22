"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Modal } from "@/components/admin/ui/Modal";
import { Field, Input, Textarea, ActionButton } from "@/components/admin/ui";
import { ImageUpload } from "@/components/admin/ui/ImageUpload";
import { teamMemberSchema, type TeamMemberFormValues } from "@/lib/schemas";
import { saveTeamMemberAction, uploadImageToStorage } from "@/lib/actions";

interface TeamMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member?: TeamMemberFormValues | null;
  onSave: (savedMember: TeamMemberFormValues) => void;
}

export function TeamMemberModal({
  open,
  onOpenChange,
  member,
  onSave,
}: TeamMemberModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TeamMemberFormValues>({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: {
      name: "",
      role: "",
      imageUrl: "",
      bio: "",
    },
  });

  const isEdit = Boolean(member?.id);

  useEffect(() => {
    if (member) {
      reset(member);
    } else {
      reset({
        name: "",
        role: "",
        imageUrl: "",
        bio: "",
      });
      setSelectedFile(null);
    }
    setServerError(null);
  }, [member, reset, open]);

  const onSubmit = async (data: TeamMemberFormValues) => {
    setServerError(null);
    try {
      let finalImageUrl = data.imageUrl;

      // Upload profile picture to Storage bucket placeholder
      if (selectedFile) {
        const uploadRes = await uploadImageToStorage(selectedFile, "team");
        if (uploadRes.success && uploadRes.url) {
          finalImageUrl = uploadRes.url;
        }
      }

      const payload: TeamMemberFormValues = {
        ...data,
        imageUrl: finalImageUrl,
        id: member?.id || `team-${Date.now()}`,
      };

      const res = await saveTeamMemberAction(payload);
      if (!res.success) {
        setServerError(res.error || "Failed to save team member.");
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
      title={isEdit ? `Edit Team Member: ${member?.name}` : "Add Team Member"}
      description="Manage agency staff and leadership profiles shown on the public About page."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {serverError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600">
            {serverError}
          </div>
        )}

        {/* 1. Name */}
        <Field id="name" label="Full Name" required error={errors.name?.message}>
          <Input id="name" placeholder="e.g. Deshabandu M. F. M. Farzan" {...register("name")} />
        </Field>

        {/* 2. Title / Role */}
        <Field id="role" label="Title / Role" required error={errors.role?.message}>
          <Input id="role" placeholder="e.g. Managing Director / Recruitment Manager" {...register("role")} />
        </Field>

        {/* 3. Image Upload Component for Profile Picture */}
        <ImageUpload
          label="Profile Picture / Headshot"
          value={watch("imageUrl")}
          aspectRatio="square"
          onChange={(file, previewUrl) => {
            setSelectedFile(file);
            setValue("imageUrl", previewUrl || "");
          }}
          hint="Square format portrait photo (JPG, PNG, WebP)"
        />

        <Field id="bio" label="Biography / Short Bio (optional)" error={errors.bio?.message}>
          <Textarea
            id="bio"
            rows={3}
            placeholder="Experience in overseas manpower recruitment, certifications, credentials..."
            {...register("bio")}
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
            {isEdit ? "Update Member" : "Add Member"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
