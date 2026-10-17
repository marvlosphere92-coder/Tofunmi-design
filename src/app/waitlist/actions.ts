"use server";

import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";

export async function joinWaitlist(formData: FormData) {
  const supabase = createServiceClient();

  const fullName = String(formData.get("fullName") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const designReference = String(formData.get("designReference") || "") || null;
  const notes = String(formData.get("notes") || "") || null;

  if (!fullName || !phone) {
    throw new Error("Name and phone are required.");
  }

  await supabase.from("waitlist_entries").insert({
    full_name: fullName,
    phone,
    design_reference: designReference,
    notes,
  });

  redirect("/waitlist/thanks");
}
