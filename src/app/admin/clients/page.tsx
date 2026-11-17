import { createClient } from "@/lib/supabase/server";
import { fetchAllRows } from "@/lib/supabase/fetchAll";
import { AdminClientsList } from "@/components/admin/AdminClientsList";
import type { Client } from "@/types/db";

export default async function AdminClientsPage() {
  const supabase = await createClient();

  const [{ data: clients }, orders] = await Promise.all([
    supabase.from("clients").select("*").order("created_at", { ascending: false }),
    // Order counts shown per client — needs every order, not just the
    // most recent 1000 site-wide.
    fetchAllRows<{ client_id: string | null }>((from, to) =>
      supabase.from("orders").select("client_id").range(from, to)
    ),
  ]);

  const orderCounts: Record<string, number> = {};
  for (const o of orders) {
    if (!o.client_id) continue;
    orderCounts[o.client_id] = (orderCounts[o.client_id] ?? 0) + 1;
  }

  return (
    <div>
      <h1 className="font-serif text-2xl mb-6">Clients</h1>
      <AdminClientsList clients={(clients ?? []) as Client[]} orderCounts={orderCounts} />
    </div>
  );
}
