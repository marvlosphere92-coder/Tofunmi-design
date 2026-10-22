"use client";

import { useMemo, useState } from "react";
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

export interface OrderRow {
  id: string;
  reference: string;
  status: string;
  event_date: string | null;
  budget_note: string | null;
  estimated_price: number | null;
  final_price: number | null;
  clients: { full_name: string; phone: string } | null;
  designs: { title: string } | null;
}

export function AdminOrdersList({
  orders,
  updateOrderStatus,
  updateOrderDetails,
}: {
  orders: OrderRow[];
  updateOrderStatus: (formData: FormData) => void;
  updateOrderDetails: (formData: FormData) => void;
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter((o) => {
      const client = o.clients;
      return (
        o.reference.toLowerCase().includes(q) ||
        client?.full_name?.toLowerCase().includes(q) ||
        client?.phone?.toLowerCase().includes(q) ||
        o.designs?.title?.toLowerCase().includes(q)
      );
    });
  }, [orders, search]);

  return (
    <div>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name, phone, reference, or design…"
        className="w-full rounded-md border border-accent-soft px-3 py-2 mb-4"
      />
      <div className="space-y-3">
        {filtered.map((o) => {
          const client = o.clients;
          const design = o.designs;
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
                    key={o.status}
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

              {o.status === "completed" && o.final_price == null && (
                <p className="text-xs text-red-700 bg-red-50 rounded-md px-2 py-1">
                  Completed with no final price set — this order won&apos;t count toward revenue
                  until you add one below.
                </p>
              )}

              <form
                action={updateOrderDetails}
                className="flex flex-wrap items-end gap-2 border-t border-accent-soft pt-3"
              >
                <input type="hidden" name="orderId" value={o.id} />
                <label className="text-xs text-foreground/60">
                  Delivery date
                  <input
                    type="date"
                    name="eventDate"
                    defaultValue={o.event_date ?? ""}
                    className="block rounded-md border border-accent-soft px-2 py-1 text-sm mt-1"
                  />
                </label>
                <label className="text-xs text-foreground/60">
                  Estimated price (₦)
                  <input
                    type="number"
                    name="estimatedPrice"
                    defaultValue={o.estimated_price ?? ""}
                    className="block w-32 rounded-md border border-accent-soft px-2 py-1 text-sm mt-1"
                  />
                </label>
                <label className="text-xs text-foreground/60">
                  Final price (₦)
                  <input
                    type="number"
                    name="finalPrice"
                    defaultValue={o.final_price ?? ""}
                    className="block w-32 rounded-md border border-accent-soft px-2 py-1 text-sm mt-1"
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
        {filtered.length === 0 && (
          <p className="text-foreground/60">
            {orders.length === 0 ? "No orders yet." : "No orders match your search."}
          </p>
        )}
      </div>
    </div>
  );
}
