import { createClient } from "@/lib/supabase/server";
import { updateOrderStatus } from "./actions";

const statuses = [
  "requested",
  "confirmed",
  "fabric_received",
  "cutting",
  "sewing",
  "ready_for_fitting",
  "ready_for_pickup",
  "completed",
  "cancelled",
];

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("id, reference, status, event_date, created_at, clients(full_name, phone), designs(title)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-serif text-2xl mb-6">Orders</h1>
      <div className="space-y-3">
        {(orders ?? []).map((o) => {
          const client = o.clients as unknown as { full_name: string; phone: string } | null;
          const design = o.designs as unknown as { title: string } | null;
          return (
            <div
              key={o.id}
              className="rounded-lg border border-accent-soft p-4 flex flex-wrap items-center justify-between gap-3"
            >
              <div>
                <p className="font-medium">
                  {o.reference} — {client?.full_name ?? "Unknown"}
                </p>
                <p className="text-sm text-foreground/60">
                  {design?.title ?? "—"} · {client?.phone}
                  {o.event_date ? ` · event ${o.event_date}` : ""}
                </p>
              </div>
              <form action={updateOrderStatus} className="flex items-center gap-2">
                <input type="hidden" name="orderId" value={o.id} />
                <select
                  name="status"
                  defaultValue={o.status}
                  className="rounded-md border border-accent-soft px-2 py-1 text-sm"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {s.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
                <button type="submit" className="rounded-full bg-accent text-white px-4 py-1 text-sm">
                  Update
                </button>
              </form>
            </div>
          );
        })}
        {(!orders || orders.length === 0) && (
          <p className="text-foreground/60">No orders yet.</p>
        )}
      </div>
    </div>
  );
}
