import { createClient } from "@/lib/supabase/server";
import { updateOrderStatus, updateOrderDetails } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";

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
    .select(
      "id, reference, status, event_date, budget_note, created_at, clients(full_name, phone), designs(title)"
    )
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-serif text-2xl mb-6">Orders</h1>
      <div className="space-y-3">
        {(orders ?? []).map((o) => {
          const client = o.clients as unknown as { full_name: string; phone: string } | null;
          const design = o.designs as unknown as { title: string } | null;
          return (
            <div key={o.id} className="rounded-lg border border-accent-soft p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium">
                    {o.reference} — {client?.full_name ?? "Unknown"}
                  </p>
                  <p className="text-sm text-foreground/60">
                    {design?.title ?? "—"} · {client?.phone}
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
                  <SubmitButton
                    className="rounded-full bg-accent text-white px-4 py-1 text-sm"
                    pendingText="Updating…"
                  >
                    Update status
                  </SubmitButton>
                </form>
              </div>

              <form
                action={updateOrderDetails}
                className="flex flex-wrap items-end gap-2 border-t border-accent-soft pt-3"
              >
                <input type="hidden" name="orderId" value={o.id} />
                <label className="text-xs text-foreground/60">
                  Event date
                  <input
                    type="date"
                    name="eventDate"
                    defaultValue={o.event_date ?? ""}
                    className="block rounded-md border border-accent-soft px-2 py-1 text-sm mt-1"
                  />
                </label>
                <label className="text-xs text-foreground/60 flex-1 min-w-[180px]">
                  Notes
                  <input
                    type="text"
                    name="budgetNote"
                    defaultValue={o.budget_note ?? ""}
                    className="block w-full rounded-md border border-accent-soft px-2 py-1 text-sm mt-1"
                  />
                </label>
                <SubmitButton
                  className="rounded-full border border-accent-soft px-4 py-1 text-sm"
                  pendingText="Saving…"
                >
                  Save details
                </SubmitButton>
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
