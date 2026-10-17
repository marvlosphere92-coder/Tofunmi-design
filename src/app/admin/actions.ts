"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function updateCapacity(formData: FormData) {
  const supabase = createServiceClient();
  const acceptingOrders = formData.get("acceptingOrders") === "on";
  const bookedUntil = String(formData.get("bookedUntil") || "") || null;

  await supabase
    .from("capacity_settings")
    .update({ accepting_orders: acceptingOrders, booked_until: bookedUntil, updated_at: new Date().toISOString() })
    .eq("id", 1);

  revalidatePath("/admin");
  revalidatePath("/");
}
