"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";

export async function updateClient(formData: FormData) {
  const supabase = createServiceClient();
  const id = String(formData.get("clientId"));

  await supabase
    .from("clients")
    .update({
      full_name: String(formData.get("fullName") || ""),
      phone: String(formData.get("phone") || ""),
      email: String(formData.get("email") || "") || null,
    })
    .eq("id", id);

  revalidatePath("/admin/clients");
  revalidatePath(`/admin/clients/${id}`);
}
