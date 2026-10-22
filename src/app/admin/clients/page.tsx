import { createClient } from "@/lib/supabase/server";
import { AdminClientsList } from "@/components/admin/AdminClientsList";
import type { Client } from "@/types/db";

export default async function AdminClientsPage() {
  const supabase = await createClient();

  const [{ data: clients }, { data: orders }] = await Promise.all([
    supabase.from("clients").select("*").order("created_at", { ascending: false }),
    supabase.from("orders").select("client_id"),
  ]);

  const orderCounts: Record<string, number> = {};
  for (const o of orders ?? []) {
    orderCounts[o.client_id] = (orderCounts[o.client_id] ?? 0) + 1;
  }

  return (
    <div>
      <h1 className="font-serif text-2xl mb-6">Clients</h1>
      <AdminClientsList clients={(clients ?? []) as Client[]} orderCounts={orderCounts} />
    </div>
  );
}
