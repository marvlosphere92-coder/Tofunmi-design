"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";

export async function toggleWaitlistContacted(formData: FormData) {
  const supabase = createServiceClient();
  const id = String(formData.get("entryId"));
  const contacted = formData.get("contacted") === "true";

  await supabase.from("waitlist_entries").update({ contacted: !contacted }).eq("id", id);

  revalidatePath("/admin/waitlist");
}

export async function deleteWaitlistEntry(formData: FormData) {
  const supabase = createServiceClient();
  const id = String(formData.get("entryId"));

  await supabase.from("waitlist_entries").delete().eq("id", id);

  revalidatePath("/admin/waitlist");
}
