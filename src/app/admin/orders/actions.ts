"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { sendOrderStatusEmail, sendOrderDetailsUpdatedEmail, sendAdminNotification } from "@/lib/resend";
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

  const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
  if (error) throw new Error(`Could not update the order's status: ${error.message}`);
  const { error: eventError } = await supabase
    .from("order_status_events")
    .insert({ order_id: orderId, status });
  if (eventError) throw new Error(`Could not record the status change: ${eventError.message}`);

  const client = order?.clients as unknown as { full_name: string; email: string | null } | null;
  if (order && client?.email) {
    await sendOrderStatusEmail({
      to: client.email,
      clientName: client.full_name,
      orderReference: order.reference,
      status,
    });
  }
  if (order) {
    await sendAdminNotification({
      subject: `Order ${order.reference} status: ${status.replace(/_/g, " ")}`,
      text: `${client?.full_name ?? "A customer"}'s order ${order.reference} was just marked "${status.replace(/_/g, " ")}".`,
    });
  }

  revalidatePath("/admin/orders");
  redirect("/admin/orders?success=status-updated");
}

export async function verifyMeasurement(formData: FormData) {
  const supabase = createServiceClient();
  const measurementId = String(formData.get("measurementId"));
  const { error } = await supabase.from("measurements").update({ verified: true }).eq("id", measurementId);
  if (error) throw new Error(`Could not mark the measurement verified: ${error.message}`);
  revalidatePath("/admin/orders");
  redirect("/admin/orders?success=measurement-verified");
}

export async function updateOrderDetails(formData: FormData) {
  const supabase = createServiceClient();
  const orderId = String(formData.get("orderId"));
  const eventDate = String(formData.get("eventDate") || "") || null;
  const budgetNote = String(formData.get("budgetNote") || "") || null;
  const estimatedPrice = formData.get("estimatedPrice") ? Number(formData.get("estimatedPrice")) : null;
  const finalPrice = formData.get("finalPrice") ? Number(formData.get("finalPrice")) : null;

  const { data: order } = await supabase
    .from("orders")
    .select("reference, clients(full_name, email)")
    .eq("id", orderId)
    .single();

  const { error } = await supabase
    .from("orders")
    .update({
      event_date: eventDate,
      budget_note: budgetNote,
      estimated_price: estimatedPrice,
      final_price: finalPrice,
    })
    .eq("id", orderId);
  if (error) throw new Error(`Could not save those details: ${error.message}`);

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
  redirect("/admin/orders?success=details-saved");
}

export async function deleteOrder(formData: FormData) {
  const supabase = createServiceClient();
  const orderId = String(formData.get("orderId"));

  const { error } = await supabase.from("orders").delete().eq("id", orderId);
  if (error) throw new Error(`Could not delete the order: ${error.message}`);

  revalidatePath("/admin/orders");
  redirect("/admin/orders?success=order-deleted");
}
