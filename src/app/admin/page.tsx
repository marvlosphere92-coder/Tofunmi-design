import { createClient } from "@/lib/supabase/server";
import { updateCapacity } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";
import type { CapacitySettings, OrderStatus } from "@/types/db";

const statusLabels: Record<OrderStatus, string> = {
  requested: "Requested",
  confirmed: "Confirmed",
  fabric_received: "Fabric received",
  cutting: "Cutting",
  sewing: "Sewing",
  ready_for_fitting: "Ready for fitting",
  ready_for_pickup: "Ready for pickup",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default async function AdminDashboard() {
  const supabase = await createClient();

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    { data: capacity },
    { count: pendingCount },
    { count: waitlistCount },
    { data: allOrders },
  ] = await Promise.all([
    supabase.from("capacity_settings").select("*").single(),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "requested"),
    supabase.from("waitlist_entries").select("*", { count: "exact", head: true }).eq("contacted", false),
    supabase
      .from("orders")
      .select("status, created_at, final_price, design_id, designs(title)"),
  ]);

  const cap = capacity as CapacitySettings | null;
  const orders = allOrders ?? [];

  const ordersThisMonth = orders.filter(
    (o) => new Date(o.created_at) >= startOfMonth
  ).length;

  const statusCounts = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {});

  const revenue = orders
    .filter((o) => o.status === "completed" && o.final_price != null)
    .reduce((sum, o) => sum + Number(o.final_price), 0);

  const designCounts = new Map<string, number>();
  for (const o of orders) {
    const design = o.designs as unknown as { title: string } | null;
    const title = design?.title ?? "Unknown design";
    designCounts.set(title, (designCounts.get(title) ?? 0) + 1);
  }
  const topDesigns = [...designCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <div className="space-y-10">
      <h1 className="font-serif text-2xl">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-accent-soft p-5">
          <p className="text-sm text-foreground/60">New requests</p>
          <p className="text-2xl font-medium">{pendingCount ?? 0}</p>
        </div>
        <div className="rounded-lg border border-accent-soft p-5">
          <p className="text-sm text-foreground/60">Waitlist (uncontacted)</p>
          <p className="text-2xl font-medium">{waitlistCount ?? 0}</p>
        </div>
      </div>

      <section>
        <h2 className="font-medium mb-3">Orders &amp; sales</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="rounded-lg border border-accent-soft p-5">
            <p className="text-sm text-foreground/60">Orders this month</p>
            <p className="text-2xl font-medium">{ordersThisMonth}</p>
          </div>
          <div className="rounded-lg border border-accent-soft p-5">
            <p className="text-sm text-foreground/60">Revenue (completed orders)</p>
            <p className="text-2xl font-medium">₦{revenue.toLocaleString()}</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-medium mb-2">By status</p>
            <div className="space-y-1 text-sm">
              {Object.entries(statusLabels).map(([key, label]) => (
                <div key={key} className="flex justify-between text-foreground/70">
                  <span>{label}</span>
                  <span>{statusCounts[key] ?? 0}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium mb-2">Most requested designs</p>
            {topDesigns.length === 0 ? (
              <p className="text-sm text-foreground/60">No orders yet.</p>
            ) : (
              <div className="space-y-1 text-sm">
                {topDesigns.map(([title, count]) => (
                  <div key={title} className="flex justify-between text-foreground/70">
                    <span>{title}</span>
                    <span>{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-medium mb-3">Booking capacity</h2>
        <form action={updateCapacity} className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="acceptingOrders"
              defaultChecked={cap?.accepting_orders ?? true}
            />
            Currently accepting new orders
          </label>
          <input
            type="date"
            name="bookedUntil"
            defaultValue={cap?.booked_until ?? ""}
            className="rounded-md border border-accent-soft px-3 py-2 text-sm"
          />
          <SubmitButton className="rounded-full bg-accent text-white px-5 py-2 text-sm" pendingText="Saving…">
            Save
          </SubmitButton>
        </form>
        <p className="text-xs text-foreground/60 mt-2">
          When unchecked, the order form sends clients to the waitlist instead.
        </p>
      </section>
    </div>
  );
}
