"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";

function revalidateMaterialPaths() {
  revalidatePath("/admin/materials");
  revalidatePath("/designs"); // order form on each design page reads materials
}

export async function createMaterial(formData: FormData) {
  const supabase = createServiceClient();

  await supabase.from("materials").insert({
    name: String(formData.get("name") || ""),
    type: String(formData.get("type") || "") || null,
    price_per_yard: Number(formData.get("pricePerYard") || 0),
    in_stock: true,
  });

  revalidateMaterialPaths();
}

export async function updateMaterial(formData: FormData) {
  const supabase = createServiceClient();
  const id = String(formData.get("materialId"));

  await supabase
    .from("materials")
    .update({
      name: String(formData.get("name") || ""),
      type: String(formData.get("type") || "") || null,
      price_per_yard: Number(formData.get("pricePerYard") || 0),
      in_stock: formData.get("inStock") === "on",
    })
    .eq("id", id);

  revalidateMaterialPaths();
}
