import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Client } from "@/types/db";

export default async function AdminClientsPage() {
  const supabase = await createClient();

  const [{ data: clients }, { data: orders }] = await Promise.all([
    supabase.from("clients").select("*").order("created_at", { ascending: false }),
    supabase.from("orders").select("client_id"),
  ]);

  const orderCounts = new Map<string, number>();
  for (const o of orders ?? []) {
    orderCounts.set(o.client_id, (orderCounts.get(o.client_id) ?? 0) + 1);
  }

  const list = (clients ?? []) as Client[];

  return (
    <div>
      <h1 className="font-serif text-2xl mb-6">Clients</h1>
      <div className="space-y-2">
        {list.map((c) => (
          <Link
            key={c.id}
            href={`/admin/clients/${c.id}`}
            className="rounded-lg border border-accent-soft p-4 flex items-center justify-between gap-3 transition hover:bg-accent-soft/40"
          >
            <div>
              <p className="font-medium">{c.full_name}</p>
              <p className="text-sm text-foreground/60">
                {c.phone}
                {c.email ? ` · ${c.email}` : ""}
              </p>
            </div>
            <p className="text-sm text-foreground/60">
              {orderCounts.get(c.id) ?? 0} order{orderCounts.get(c.id) === 1 ? "" : "s"}
            </p>
          </Link>
        ))}
        {list.length === 0 && <p className="text-foreground/60">No clients yet.</p>}
      </div>
    </div>
  );
}
