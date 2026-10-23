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
  own_fabric: boolean;
  clients: { full_name: string; phone: string } | null;
  designs: { title: string; cover_photo_url: string | null } | null;
  materials: { name: string; price_per_yard: number } | null;
  measurements: {
    id: string;
    source: "client" | "designer";
    verified: boolean;
    bust: number | null;
    waist: number | null;
    hip: number | null;
    shoulder: number | null;
    sleeve_length: number | null;
    back_length: number | null;
    inseam: number | null;
    notes: string | null;
  } | null;
}

const MEASUREMENT_FIELDS: [keyof NonNullable<OrderRow["measurements"]>, string][] = [
  ["bust", "Bust"],
  ["waist", "Waist"],
  ["hip", "Hip"],
  ["shoulder", "Shoulder"],
  ["sleeve_length", "Sleeve length"],
  ["back_length", "Back length"],
  ["inseam", "Inseam"],
];

export function AdminOrdersList({
  orders,
  updateOrderStatus,
  updateOrderDetails,
  verifyMeasurement,
}: {
  orders: OrderRow[];
  updateOrderStatus: (formData: FormData) => void;
  updateOrderDetails: (formData: FormData) => void;
  verifyMeasurement: (formData: FormData) => void;
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
                <div className="flex items-center gap-3">
                  {design?.cover_photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={design.cover_photo_url}
                      alt=""
                      className="w-12 h-12 rounded-md object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-md bg-accent-soft flex-shrink-0" />
                  )}
                  <div>
                    <p className="font-medium">
                      {o.reference} — {client?.full_name ?? "Unknown"}
                    </p>
                    <p className="text-sm text-foreground/70">
                      {design?.title ?? "—"} · {client?.phone}
                    </p>
                  </div>
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

              <div className="flex flex-wrap gap-3 text-sm border-t border-accent-soft pt-3">
                <div className="rounded-md bg-accent-soft/30 px-3 py-2">
                  <p className="text-xs text-foreground/70 mb-0.5">Fabric</p>
                  {o.own_fabric ? (
                    <p>Client is bringing their own fabric</p>
                  ) : o.materials ? (
                    <p>
                      {o.materials.name} — ₦{o.materials.price_per_yard.toLocaleString()}/yard
                    </p>
                  ) : (
                    <p className="text-foreground/70">No fabric choice on file</p>
                  )}
                </div>

                <div className="rounded-md bg-accent-soft/30 px-3 py-2 flex-1 min-w-[220px]">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-xs text-foreground/70">Measurements</p>
                    {o.measurements && (
                      <span
                        className={`text-xs rounded-full px-2 py-0.5 ${
                          o.measurements.verified
                            ? "bg-accent text-white"
                            : "bg-gold-soft text-foreground/80"
                        }`}
                      >
                        {o.measurements.verified ? "Verified" : "Needs verifying"}
                      </span>
                    )}
                  </div>
                  {o.measurements ? (
                    <>
                      <p className="text-xs text-foreground/70 mb-1">
                        Submitted by {o.measurements.source === "client" ? "the client" : "the designer"}
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-3 gap-y-1">
                        {MEASUREMENT_FIELDS.map(([key, label]) => {
                          const value = o.measurements![key];
                          return value != null ? (
                            <p key={key}>
                              <span className="text-foreground/70">{label}:</span> {value}&quot;
                            </p>
                          ) : null;
                        })}
                      </div>
                      {o.measurements.notes && (
                        <p className="mt-1 text-xs text-foreground/70">Notes: {o.measurements.notes}</p>
                      )}
                      {!o.measurements.verified && (
                        <form action={verifyMeasurement} className="mt-2">
                          <input type="hidden" name="measurementId" value={o.measurements.id} />
                          <SubmitButton
                            className="rounded-full border border-accent-soft px-3 py-1 text-xs"
                            pendingText="Marking…"
                          >
                            Mark verified
                          </SubmitButton>
                        </form>
                      )}
                    </>
                  ) : (
                    <p className="text-foreground/70">We&apos;ll measure at a fitting — none submitted yet</p>
                  )}
                </div>
              </div>

              <form
                action={updateOrderDetails}
                className="flex flex-wrap items-end gap-2 border-t border-accent-soft pt-3"
              >
                <input type="hidden" name="orderId" value={o.id} />
                <label className="text-xs text-foreground/70">
                  Delivery date
                  <input
                    type="date"
                    name="eventDate"
                    defaultValue={o.event_date ?? ""}
                    className="block rounded-md border border-accent-soft px-2 py-1 text-sm mt-1"
                  />
                </label>
                <label className="text-xs text-foreground/70">
                  Estimated price (₦)
                  <input
                    type="number"
                    name="estimatedPrice"
                    defaultValue={o.estimated_price ?? ""}
                    className="block w-32 rounded-md border border-accent-soft px-2 py-1 text-sm mt-1"
                  />
                </label>
                <label className="text-xs text-foreground/70">
                  Final price (₦)
                  <input
                    type="number"
                    name="finalPrice"
                    defaultValue={o.final_price ?? ""}
                    className="block w-32 rounded-md border border-accent-soft px-2 py-1 text-sm mt-1"
                  />
                </label>
                <label className="text-xs text-foreground/70 flex-1 min-w-[180px]">
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
          <p className="text-foreground/70">
            {orders.length === 0 ? "No orders yet." : "No orders match your search."}
          </p>
        )}
      </div>
    </div>
  );
}
