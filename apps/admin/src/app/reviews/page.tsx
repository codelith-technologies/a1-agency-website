import type { Metadata } from "next";
import { recruitmentExperiences } from "@/data";
import { ReviewsClient } from "./ReviewsClient";

export const metadata: Metadata = { title: "Reviews & Testimonials" };

export default function ReviewsPage() {
  return <ReviewsClient initialReviews={recruitmentExperiences} />;
}
