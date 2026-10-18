"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function changePassword(formData: FormData) {
  const supabase = await createClient();
  const newPassword = String(formData.get("newPassword") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  if (newPassword.length < 8) {
    redirect("/admin/account?error=" + encodeURIComponent("Password must be at least 8 characters."));
  }
  if (newPassword !== confirmPassword) {
    redirect("/admin/account?error=" + encodeURIComponent("Passwords don't match."));
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) {
    redirect("/admin/account?error=" + encodeURIComponent(error.message));
  }

  redirect("/admin/account?success=1");
}

export async function changeEmail(formData: FormData) {
  const supabase = await createClient();
  const newEmail = String(formData.get("newEmail") || "").trim();

  if (!newEmail) {
    redirect("/admin/account?error=" + encodeURIComponent("Email is required."));
  }

  const { error } = await supabase.auth.updateUser({ email: newEmail });
  if (error) {
    redirect("/admin/account?error=" + encodeURIComponent(error.message));
  }

  redirect(
    "/admin/account?success=" +
      encodeURIComponent("Check your new email's inbox to confirm the change.")
  );
}
