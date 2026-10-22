import { createClient } from "@/lib/supabase/server";
import { AdminOrdersList, type OrderRow } from "@/components/admin/AdminOrdersList";
import { updateOrderStatus, updateOrderDetails } from "./actions";

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select(
      "id, reference, status, event_date, budget_note, estimated_price, final_price, created_at, clients(full_name, phone), designs(title)"
    )
    .order("created_at", { ascending: false });

  const rows = (orders ?? []).map((o) => ({
    ...o,
    clients: o.clients as unknown as OrderRow["clients"],
    designs: o.designs as unknown as OrderRow["designs"],
  }));

  return (
    <div>
      <h1 className="font-serif text-2xl mb-6">Orders</h1>
      <AdminOrdersList
        orders={rows}
        updateOrderStatus={updateOrderStatus}
        updateOrderDetails={updateOrderDetails}
      />
    </div>
  );
}
