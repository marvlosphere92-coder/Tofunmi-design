"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import { sendOrderDetailsUpdatedEmail } from "@/lib/resend";

export async function updateOrderByClient(formData: FormData) {
  const supabase = createServiceClient();
  const orderId = String(formData.get("orderId"));
  const eventDate = String(formData.get("eventDate") || "") || null;
  const budgetNote = String(formData.get("budgetNote") || "") || null;

  const { data: order } = await supabase
    .from("orders")
    .select("reference, clients(full_name, email)")
    .eq("id", orderId)
    .single();

  if (!order) return;

  await supabase
    .from("orders")
    .update({ event_date: eventDate, budget_note: budgetNote })
    .eq("id", orderId);

  const client = order.clients as unknown as { full_name: string; email: string | null } | null;
  if (client?.email) {
    await sendOrderDetailsUpdatedEmail({
      to: client.email,
      clientName: client.full_name,
      orderReference: order.reference,
      changedBy: "client",
      eventDate,
      budgetNote,
    });
  }

  revalidatePath(`/order/manage/${orderId}`);
}
