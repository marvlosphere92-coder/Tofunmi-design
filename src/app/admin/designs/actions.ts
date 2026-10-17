"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import type { DesignCategory } from "@/types/db";

export async function createDesign(formData: FormData) {
  const supabase = createServiceClient();

  const { count } = await supabase.from("designs").select("*", { count: "exact", head: true });
  const reference = `MS-${String((count ?? 0) + 1).padStart(4, "0")}`;

  const coverPhotoUrl = String(formData.get("coverPhotoUrl") || "") || null;

  await supabase.from("designs").insert({
    reference,
    title: String(formData.get("title") || ""),
    category: String(formData.get("category") || "other") as DesignCategory,
    description: String(formData.get("description") || "") || null,
    labour_price: Number(formData.get("labourPrice") || 0),
    estimated_yards: formData.get("estimatedYards") ? Number(formData.get("estimatedYards")) : null,
    cover_photo_url: coverPhotoUrl,
    photos: coverPhotoUrl ? [coverPhotoUrl] : [],
    active: true,
  });

  revalidatePath("/admin/designs");
  revalidatePath("/designs");
  revalidatePath("/");
}

export async function toggleDesignActive(formData: FormData) {
  const supabase = createServiceClient();
  const id = String(formData.get("designId"));
  const active = formData.get("active") === "true";

  await supabase.from("designs").update({ active: !active }).eq("id", id);

  revalidatePath("/admin/designs");
  revalidatePath("/designs");
  revalidatePath("/");
}
