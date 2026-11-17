import { createClient } from "@/lib/supabase/server";
import { fetchAllRows } from "@/lib/supabase/fetchAll";
import { AdminOrdersList, type OrderRow } from "@/components/admin/AdminOrdersList";
import { SuccessBanner } from "@/components/admin/SuccessBanner";
import { updateOrderStatus, updateOrderDetails, verifyMeasurement, deleteOrder } from "./actions";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const { success } = await searchParams;
  const supabase = await createClient();
  // This is the admin's only view of orders — a plain .select() would
  // quietly hide every order past this project's 1000-row cap instead
  // of erroring, so this has to page through everything.
  const orders = await fetchAllRows((from, to) =>
    supabase
      .from("orders")
      .select(
        "id, reference, status, event_date, budget_note, estimated_price, final_price, created_at, own_fabric, clients(full_name, phone), designs(title, cover_photo_url), materials(name, price_per_yard), measurements(id, source, verified, bust, waist, hip, shoulder, sleeve_length, back_length, inseam, notes)"
      )
      .order("created_at", { ascending: false })
      .range(from, to)
  );

  const rows = orders.map((o) => ({
    ...o,
    clients: o.clients as unknown as OrderRow["clients"],
    designs: o.designs as unknown as OrderRow["designs"],
    materials: o.materials as unknown as OrderRow["materials"],
    measurements: o.measurements as unknown as OrderRow["measurements"],
  }));

  return (
    <div>
      <h1 className="font-serif text-2xl mb-6">Orders</h1>
      <SuccessBanner success={success} />
      <AdminOrdersList
        orders={rows}
        updateOrderStatus={updateOrderStatus}
        updateOrderDetails={updateOrderDetails}
        verifyMeasurement={verifyMeasurement}
        deleteOrder={deleteOrder}
      />
    </div>
  );
}
