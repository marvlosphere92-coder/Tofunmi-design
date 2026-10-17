import { createClient } from "@/lib/supabase/server";
import { updateCapacity } from "./actions";
import type { CapacitySettings } from "@/types/db";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [{ data: capacity }, { count: pendingCount }, { count: waitlistCount }] =
    await Promise.all([
      supabase.from("capacity_settings").select("*").single(),
      supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "requested"),
      supabase.from("waitlist_entries").select("*", { count: "exact", head: true }).eq("contacted", false),
    ]);

  const cap = capacity as CapacitySettings | null;

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
          <button type="submit" className="rounded-full bg-accent text-white px-5 py-2 text-sm">
            Save
          </button>
        </form>
        <p className="text-xs text-foreground/60 mt-2">
          When unchecked, the order form sends clients to the waitlist instead.
        </p>
      </section>
    </div>
  );
}
