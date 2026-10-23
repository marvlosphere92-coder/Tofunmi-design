import { createClient } from "@/lib/supabase/server";
import { AdminOrdersList, type OrderRow } from "@/components/admin/AdminOrdersList";
import { updateOrderStatus, updateOrderDetails, verifyMeasurement } from "./actions";

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select(
      "id, reference, status, event_date, budget_note, estimated_price, final_price, created_at, own_fabric, clients(full_name, phone), designs(title, cover_photo_url), materials(name, price_per_yard), measurements(id, source, verified, bust, waist, hip, shoulder, sleeve_length, back_length, inseam, notes)"
    )
    .order("created_at", { ascending: false });

  const rows = (orders ?? []).map((o) => ({
    ...o,
    clients: o.clients as unknown as OrderRow["clients"],
    designs: o.designs as unknown as OrderRow["designs"],
    materials: o.materials as unknown as OrderRow["materials"],
    measurements: o.measurements as unknown as OrderRow["measurements"],
  }));

  return (
    <div>
      <h1 className="font-serif text-2xl mb-6">Orders</h1>
      <AdminOrdersList
        orders={rows}
        updateOrderStatus={updateOrderStatus}
        updateOrderDetails={updateOrderDetails}
        verifyMeasurement={verifyMeasurement}
      />
    </div>
  );
}
