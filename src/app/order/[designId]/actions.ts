"use server";

import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { sendOrderStatusEmail } from "@/lib/resend";

async function nextReference(
  supabase: ReturnType<typeof createServiceClient>,
  table: "orders" | "designs",
  prefix: string
) {
  const { count } = await supabase.from(table).select("*", { count: "exact", head: true });
  return `${prefix}-${String((count ?? 0) + 1).padStart(4, "0")}`;
}

export async function submitOrder(formData: FormData) {
  const supabase = createServiceClient();

  const designId = String(formData.get("designId"));
  const fullName = String(formData.get("fullName") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const email = String(formData.get("email") || "").trim() || null;
  const ownFabric = formData.get("ownFabric") === "on";
  const materialId = ownFabric ? null : String(formData.get("materialId") || "") || null;
  const eventDate = String(formData.get("eventDate") || "") || null;
  const budgetNote = String(formData.get("budgetNote") || "") || null;
  const measurementChoice = String(formData.get("measurementChoice"));

  if (!fullName || !phone) {
    throw new Error("Name and phone are required.");
  }

  // Respect her capacity setting before creating anything.
  const { data: capacity } = await supabase
    .from("capacity_settings")
    .select("accepting_orders")
    .single();

  if (capacity && !capacity.accepting_orders) {
    redirect(`/waitlist?design=${designId}`);
  }

  // Find or create the client by phone.
  let clientId: string;
  const { data: existingClient } = await supabase
    .from("clients")
    .select("id")
    .eq("phone", phone)
    .maybeSingle();

  if (existingClient) {
    clientId = existingClient.id;
  } else {
    const { data: newClient, error } = await supabase
      .from("clients")
      .insert({ full_name: fullName, phone, email })
      .select("id")
      .single();
    if (error || !newClient) throw new Error("Could not save client details.");
    clientId = newClient.id;
  }

  // Measurements: only create a row if the client chose to submit their own now.
  let measurementId: string | null = null;
  if (measurementChoice === "client") {
    const fields = ["bust", "waist", "hip", "shoulder", "sleeveLength", "backLength", "inseam"] as const;
    const dbFields: Record<string, number | null> = {};
    for (const f of fields) {
      const val = formData.get(f);
      dbFields[f === "sleeveLength" ? "sleeve_length" : f === "backLength" ? "back_length" : f] = val
        ? Number(val)
        : null;
    }
    const { data: measurement } = await supabase
      .from("measurements")
      .insert({ client_id: clientId, source: "client", verified: false, ...dbFields })
      .select("id")
      .single();
    measurementId = measurement?.id ?? null;
  }

  const reference = await nextReference(supabase, "orders", "ORD");

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      reference,
      client_id: clientId,
      design_id: designId,
      measurement_id: measurementId,
      material_id: materialId,
      own_fabric: ownFabric,
      event_date: eventDate,
      budget_note: budgetNote,
      status: "requested",
    })
    .select("id")
    .single();

  if (orderError || !order) throw new Error("Could not create the order.");

  await supabase
    .from("order_status_events")
    .insert({ order_id: order.id, status: "requested" });

  if (email) {
    const base =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    await sendOrderStatusEmail({
      to: email,
      clientName: fullName,
      orderReference: reference,
      status: "requested — we'll confirm details on WhatsApp shortly",
      manageUrl: `${base}/order/manage/${order.id}`,
    });
  }

  redirect(
    `/order/confirmation?ref=${reference}&name=${encodeURIComponent(fullName)}&id=${order.id}`
  );
}
