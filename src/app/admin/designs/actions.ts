"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import type { DesignCategory } from "@/types/db";

async function nextReference(supabase: ReturnType<typeof createServiceClient>) {
  const { count } = await supabase.from("designs").select("*", { count: "exact", head: true });
  return `MS-${String((count ?? 0) + 1).padStart(4, "0")}`;
}

async function nextDisplayOrder(supabase: ReturnType<typeof createServiceClient>) {
  const { data } = await supabase
    .from("designs")
    .select("display_order")
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data?.display_order ?? 0) + 1;
}

function revalidateDesignPaths() {
  revalidatePath("/admin/designs");
  revalidatePath("/designs");
  revalidatePath("/");
}

export async function createDesign(formData: FormData) {
  const supabase = createServiceClient();

  const reference = await nextReference(supabase);
  const displayOrder = await nextDisplayOrder(supabase);
  const coverPhotoUrl = String(formData.get("coverPhotoUrl") || "") || null;

  await supabase.from("designs").insert({
    reference,
    title: String(formData.get("title") || ""),
    category: String(formData.get("category") || "other") as DesignCategory,
    description: String(formData.get("description") || "") || null,
    labour_price: formData.get("labourPrice") ? Number(formData.get("labourPrice")) : null,
    estimated_yards: formData.get("estimatedYards") ? Number(formData.get("estimatedYards")) : null,
    cover_photo_url: coverPhotoUrl,
    photos: coverPhotoUrl ? [coverPhotoUrl] : [],
    active: true,
    display_order: displayOrder,
  });

  revalidateDesignPaths();
}

export async function toggleDesignActive(formData: FormData) {
  const supabase = createServiceClient();
  const id = String(formData.get("designId"));
  const active = formData.get("active") === "true";

  await supabase.from("designs").update({ active: !active }).eq("id", id);

  revalidateDesignPaths();
}

export async function moveDesign(formData: FormData) {
  const supabase = createServiceClient();
  const id = String(formData.get("designId"));
  const direction = String(formData.get("direction")); // "up" | "down"

  const { data: all } = await supabase
    .from("designs")
    .select("id, display_order")
    .order("display_order", { ascending: true });
  if (!all) return;

  const index = all.findIndex((d) => d.id === id);
  if (index === -1) return;
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= all.length) return;

  const current = all[index];
  const neighbor = all[swapIndex];

  await Promise.all([
    supabase.from("designs").update({ display_order: neighbor.display_order }).eq("id", current.id),
    supabase.from("designs").update({ display_order: current.display_order }).eq("id", neighbor.id),
  ]);

  revalidateDesignPaths();
}

export async function updateDesign(formData: FormData) {
  const supabase = createServiceClient();
  const id = String(formData.get("designId"));
  const coverPhotoUrl = String(formData.get("coverPhotoUrl") || "") || null;

  await supabase
    .from("designs")
    .update({
      title: String(formData.get("title") || ""),
      category: String(formData.get("category") || "other") as DesignCategory,
      description: String(formData.get("description") || "") || null,
      labour_price: formData.get("labourPrice") ? Number(formData.get("labourPrice")) : null,
      estimated_yards: formData.get("estimatedYards") ? Number(formData.get("estimatedYards")) : null,
      cover_photo_url: coverPhotoUrl,
      photos: coverPhotoUrl ? [coverPhotoUrl] : [],
    })
    .eq("id", id);

  revalidateDesignPaths();
  revalidatePath(`/admin/designs/${id}/edit`);
}

export async function createDraftDesigns(formData: FormData) {
  const supabase = createServiceClient();
  const urls = formData.getAll("photoUrls").map(String).filter(Boolean);
  if (urls.length === 0) return;

  const reference = await nextReference(supabase);
  const refNum = Number(reference.split("-")[1]);
  const displayOrder = await nextDisplayOrder(supabase);

  const rows = urls.map((url, i) => ({
    reference: `MS-${String(refNum + i).padStart(4, "0")}`,
    title: "Untitled design",
    category: "other" as DesignCategory,
    cover_photo_url: url,
    photos: [url],
    active: false, // draft: hidden until she fills in the details
    display_order: displayOrder + i,
  }));

  await supabase.from("designs").insert(rows);

  revalidateDesignPaths();
}
