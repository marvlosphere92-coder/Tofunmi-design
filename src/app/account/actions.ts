"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function signOutCustomer() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function submitBuyerReview(formData: FormData) {
  const session = await createClient();
  const { data: userData } = await session.auth.getUser();
  if (!userData.user) throw new Error("Not signed in.");

  const supabase = createServiceClient();
  const orderId = String(formData.get("orderId"));
  const rating = Number(formData.get("rating"));
  const body = String(formData.get("body") || "").trim() || null;
  const photoUrl = String(formData.get("photoUrl") || "") || null;

  if (!rating) throw new Error("A rating is required.");

  // Verify this order actually belongs to the signed-in customer and is
  // completed, rather than trusting the submitted orderId outright.
  const { data: order } = await supabase
    .from("orders")
    .select("id, design_id, status, clients(user_id, full_name)")
    .eq("id", orderId)
    .single();

  const client = order?.clients as unknown as { user_id: string | null; full_name: string } | null;
  if (!order || client?.user_id !== userData.user.id || order.status !== "completed") {
    throw new Error("You can only review your own completed orders.");
  }

  const { data: myClient } = await supabase
    .from("clients")
    .select("id")
    .eq("user_id", userData.user.id)
    .single();

  await supabase.from("reviews").insert({
    client_id: myClient?.id,
    order_id: orderId,
    design_id: order.design_id,
    reviewer_name: client.full_name,
    rating,
    body,
    photo_url: photoUrl,
    source: "buyer",
    published: true,
  });

  revalidatePath("/account");
  revalidatePath("/");
  revalidatePath("/reviews");
}
