"use server";

import { revalidatePath } from "next/cache";
import type {
  CountryFormValues,
  CategoryFormValues,
  ReviewFormValues,
  AnnouncementFormValues,
  EventFormValues,
  FAQFormValues,
  TeamMemberFormValues,
} from "./schemas";

/**
 * Storage Bucket Upload Handler (Ready for database/cloud storage integration)
 * Accepts File or FormData, handles in-memory preview or data URL until S3/Supabase storage is connected.
 */
export async function uploadImageToStorage(
  file: File | FormData | any,
  bucket: "flags" | "events" | "team" | "media" = "media"
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    if (file && typeof file === "object" && "arrayBuffer" in file && typeof file.arrayBuffer === "function") {
      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const mime = (file as File).type || "image/jpeg";
        const base64 = buffer.toString("base64");
        return {
          success: true,
          url: `data:${mime};base64,${base64}`,
        };
      } catch (inner) {
        console.warn("[uploadImageToStorage] fallback to placeholder:", inner);
      }
    }
    return {
      success: true,
      url: `/images/placeholder-${bucket}.webp`,
    };
  } catch (err: any) {
    console.error("[Storage Action Error]", err);
    return { success: false, error: err?.message || "Failed to upload image." };
  }
}

// ─── 1. Country Server Actions ───────────────────────────────────────────────
export async function saveCountryAction(data: CountryFormValues) {
  try {
    console.log("[Server Action] saveCountryAction:", data);
    revalidatePath("/taxonomy/countries");
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to save country." };
  }
}

// ─── 2. Category Server Actions ──────────────────────────────────────────────
export async function saveCategoryAction(data: CategoryFormValues) {
  try {
    console.log("[Server Action] saveCategoryAction:", data);
    revalidatePath("/taxonomy/categories");
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to save category." };
  }
}

// ─── 3. Review Server Actions ────────────────────────────────────────────────
export async function saveReviewAction(data: ReviewFormValues) {
  try {
    console.log("[Server Action] saveReviewAction:", data);
    revalidatePath("/reviews");
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to save review." };
  }
}

// ─── 4. Announcement Server Actions ──────────────────────────────────────────
export async function saveAnnouncementAction(data: AnnouncementFormValues) {
  try {
    console.log("[Server Action] saveAnnouncementAction:", data);
    revalidatePath("/announcements");
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to save announcement." };
  }
}

// ─── 5. Event Server Actions ─────────────────────────────────────────────────
export async function saveEventAction(data: EventFormValues) {
  try {
    console.log("[Server Action] saveEventAction:", data);
    revalidatePath("/events");
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to save event." };
  }
}

// ─── 6. FAQ Server Actions ───────────────────────────────────────────────────
export async function saveFAQAction(data: FAQFormValues) {
  try {
    console.log("[Server Action] saveFAQAction:", data);
    revalidatePath("/faqs");
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to save FAQ." };
  }
}

// ─── 7. Team Member Server Actions ───────────────────────────────────────────
export async function saveTeamMemberAction(data: TeamMemberFormValues) {
  try {
    console.log("[Server Action] saveTeamMemberAction:", data);
    revalidatePath("/team");
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to save team member." };
  }
}
