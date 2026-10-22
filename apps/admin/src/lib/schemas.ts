import { z } from "zod";

// ─── 1. Taxonomy: Country Schema ─────────────────────────────────────────────
export const countrySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Country name must be at least 2 characters"),
  region: z.string().min(2, "Region is required"),
  flag: z.string().optional(),
  summary: z.string().optional(),
  imageUrl: z.string().optional(),
  active: z.boolean(),
});

export type CountryFormValues = z.infer<typeof countrySchema>;

// ─── 2. Taxonomy: Job Category Schema ────────────────────────────────────────
export const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Category name must be at least 2 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  slug: z.string().optional(),
  icon: z.string().optional(),
  jobCount: z.number().optional(),
  agencyConfirmed: z.boolean(),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

// ─── 3. Reviews & Testimonials Schema ───────────────────────────────────────
export const reviewSchema = z.object({
  id: z.string().optional(),
  reviewerName: z.string().min(2, "Reviewer name is required"),
  reviewText: z.string().min(10, "Review text must be at least 10 characters"),
  rating: z.number().min(1, "Rating must be between 1 and 5").max(5, "Rating must be between 1 and 5"),
  role: z.string().optional(),
  country: z.string().optional(),
  type: z.enum(["candidate", "employer"]).optional(),
  verified: z.boolean(),
});

export type ReviewFormValues = z.infer<typeof reviewSchema>;

// ─── 4. Announcements Schema ────────────────────────────────────────────────
export const announcementSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().min(10, "Announcement message must be at least 10 characters"),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  audience: z.enum(["all", "candidates", "employers"]),
  expiryDate: z.string().optional(),
  active: z.boolean(),
});

export type AnnouncementFormValues = z.infer<typeof announcementSchema>;

// ─── 5. Event Management Schema ─────────────────────────────────────────────
export const eventSchema = z.object({
  id: z.string().optional(),
  topic: z.string().min(3, "Event topic / title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  imageUrl: z.string().optional(),
  date: z.string().optional(),
  location: z.string().optional(),
});

export type EventFormValues = z.infer<typeof eventSchema>;

// ─── 6. FAQs Schema ─────────────────────────────────────────────────────────
export const faqSchema = z.object({
  id: z.string().optional(),
  question: z.string().min(5, "Question must be at least 5 characters"),
  answer: z.string().min(10, "Answer must be at least 10 characters"),
  category: z.string().min(2, "Category is required"),
  order: z.number().optional(),
});

export type FAQFormValues = z.infer<typeof faqSchema>;

// ─── 7. Team Members Schema ─────────────────────────────────────────────────
export const teamMemberSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.string().min(2, "Title / Role must be at least 2 characters"),
  imageUrl: z.string().optional(),
  bio: z.string().optional(),
});

export type TeamMemberFormValues = z.infer<typeof teamMemberSchema>;
