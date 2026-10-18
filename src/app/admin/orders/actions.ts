"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import { sendOrderStatusEmail, sendOrderDetailsUpdatedEmail } from "@/lib/resend";
import type { OrderStatus } from "@/types/db";

export async function updateOrderStatus(formData: FormData) {
  const supabase = createServiceClient();
  const orderId = String(formData.get("orderId"));
  const status = String(formData.get("status")) as OrderStatus;

  const { data: order } = await supabase
    .from("orders")
    .select("reference, clients(full_name, email)")
    .eq("id", orderId)
    .single();

  await supabase.from("orders").update({ status }).eq("id", orderId);
  await supabase.from("order_status_events").insert({ order_id: orderId, status });

  const client = order?.clients as unknown as { full_name: string; email: string | null } | null;
  if (order && client?.email) {
    await sendOrderStatusEmail({
      to: client.email,
      clientName: client.full_name,
      orderReference: order.reference,
      status,
    });
  }

  revalidatePath("/admin/orders");
}

export async function updateOrderDetails(formData: FormData) {
  const supabase = createServiceClient();
  const orderId = String(formData.get("orderId"));
  const eventDate = String(formData.get("eventDate") || "") || null;
  const budgetNote = String(formData.get("budgetNote") || "") || null;

  const { data: order } = await supabase
    .from("orders")
    .select("reference, clients(full_name, email)")
    .eq("id", orderId)
    .single();

  await supabase
    .from("orders")
    .update({ event_date: eventDate, budget_note: budgetNote })
    .eq("id", orderId);

  const client = order?.clients as unknown as { full_name: string; email: string | null } | null;
  if (order && client?.email) {
    await sendOrderDetailsUpdatedEmail({
      to: client.email,
      clientName: client.full_name,
      orderReference: order.reference,
      changedBy: "admin",
      eventDate,
      budgetNote,
    });
  }

  revalidatePath("/admin/orders");
}
