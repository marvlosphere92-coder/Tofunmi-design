"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";

export async function createAdminReview(formData: FormData) {
  const supabase = createServiceClient();

  const reviewerName = String(formData.get("reviewerName") || "").trim();
  const rating = Number(formData.get("rating"));
  const body = String(formData.get("body") || "").trim() || null;
  const designId = String(formData.get("designId") || "") || null;
  const photoUrl = String(formData.get("photoUrl") || "") || null;

  if (!reviewerName || !rating) {
    throw new Error("Name and rating are required.");
  }

  await supabase.from("reviews").insert({
    reviewer_name: reviewerName,
    rating,
    body,
    design_id: designId,
    photo_url: photoUrl,
    source: "admin",
    published: true,
  });

  revalidatePath("/admin/reviews");
  revalidatePath("/");
  revalidatePath("/reviews");
}

export async function toggleReviewPublished(formData: FormData) {
  const supabase = createServiceClient();
  const id = String(formData.get("reviewId"));
  const published = formData.get("published") === "true";

  await supabase.from("reviews").update({ published: !published }).eq("id", id);

  revalidatePath("/admin/reviews");
  revalidatePath("/");
  revalidatePath("/reviews");
}

export async function deleteReview(formData: FormData) {
  const supabase = createServiceClient();
  const id = String(formData.get("reviewId"));

  await supabase.from("reviews").delete().eq("id", id);

  revalidatePath("/admin/reviews");
  revalidatePath("/");
  revalidatePath("/reviews");
}
