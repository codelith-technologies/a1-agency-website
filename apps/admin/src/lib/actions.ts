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

// ─── 1. Country Actions ──────────────────────────────────────────────────────
export async function saveCountryAction(data: CountryFormValues) {
  try {
    console.log("[Action] saveCountryAction:", data);
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to save country." };
  }
}

// ─── 2. Category Actions ─────────────────────────────────────────────────────
export async function saveCategoryAction(data: CategoryFormValues) {
  try {
    console.log("[Action] saveCategoryAction:", data);
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to save category." };
  }
}

// ─── 3. Review Actions ───────────────────────────────────────────────────────
export async function saveReviewAction(data: ReviewFormValues) {
  try {
    console.log("[Action] saveReviewAction:", data);
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to save review." };
  }
}

// ─── 4. Announcement Actions ─────────────────────────────────────────────────
export async function saveAnnouncementAction(data: AnnouncementFormValues) {
  try {
    console.log("[Action] saveAnnouncementAction:", data);
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to save announcement." };
  }
}

// ─── 5. Event Actions ────────────────────────────────────────────────────────
export async function saveEventAction(data: EventFormValues) {
  try {
    console.log("[Action] saveEventAction:", data);
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to save event." };
  }
}

// ─── 6. FAQ Actions ──────────────────────────────────────────────────────────
export async function saveFAQAction(data: FAQFormValues) {
  try {
    console.log("[Action] saveFAQAction:", data);
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to save FAQ." };
  }
}

// ─── 7. Team Member Actions ──────────────────────────────────────────────────
export async function saveTeamMemberAction(data: TeamMemberFormValues) {
  try {
    console.log("[Action] saveTeamMemberAction:", data);
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to save team member." };
  }
}
