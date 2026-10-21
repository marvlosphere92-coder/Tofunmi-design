import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SubmitButton } from "@/components/SubmitButton";
import { updateClient } from "../actions";
import type { Client, Measurement } from "@/types/db";

export default async function AdminClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: client }, { data: orders }, { data: measurements }] = await Promise.all([
    supabase.from("clients").select("*").eq("id", id).single(),
    supabase
      .from("orders")
      .select("id, reference, status, event_date, created_at, designs(title)")
      .eq("client_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("measurements")
      .select("*")
      .eq("client_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (!client) notFound();
  const c = client as Client;
  const orderList = orders ?? [];
  const measurementList = (measurements ?? []) as Measurement[];

  return (
    <div className="space-y-10">
      <div>
        <Link href="/admin/clients" className="text-sm underline transition hover:opacity-70">
          ← All clients
        </Link>
        <h1 className="font-serif text-2xl mt-2 mb-4">{c.full_name}</h1>
        <form action={updateClient} className="flex flex-wrap gap-2 max-w-xl">
          <input type="hidden" name="clientId" value={c.id} />
          <input
            name="fullName"
            defaultValue={c.full_name}
            placeholder="Full name"
            className="flex-1 min-w-[160px] rounded-md border border-accent-soft px-3 py-2 text-sm"
          />
          <input
            name="phone"
            defaultValue={c.phone ?? ""}
            placeholder="Phone"
            className="flex-1 min-w-[140px] rounded-md border border-accent-soft px-3 py-2 text-sm"
          />
          <input
            name="email"
            type="email"
            defaultValue={c.email ?? ""}
            placeholder="Email"
            className="flex-1 min-w-[160px] rounded-md border border-accent-soft px-3 py-2 text-sm"
          />
          <SubmitButton className="rounded-full bg-accent text-white px-5 py-2 text-sm" pendingText="Saving…">
            Save
          </SubmitButton>
        </form>
      </div>

      <section>
        <h2 className="font-medium mb-3">Orders</h2>
        <div className="space-y-2">
          {orderList.map((o) => {
            const design = o.designs as unknown as { title: string } | null;
            return (
              <Link
                key={o.id}
                href="/admin/orders"
                className="block rounded-lg border border-accent-soft p-4 transition hover:bg-accent-soft/40"
              >
                <p className="font-medium">
                  {o.reference} — {design?.title ?? "—"}
                </p>
                <p className="text-sm text-foreground/60">
                  {o.status.replace(/_/g, " ")}
                  {o.event_date ? ` · delivery ${new Date(o.event_date).toLocaleDateString()}` : ""} ·{" "}
                  placed {new Date(o.created_at).toLocaleDateString()}
                </p>
              </Link>
            );
          })}
          {orderList.length === 0 && <p className="text-foreground/60">No orders yet.</p>}
        </div>
      </section>

      <section>
        <h2 className="font-medium mb-3">Measurements</h2>
        <div className="space-y-2">
          {measurementList.map((m) => (
            <div key={m.id} className="rounded-lg border border-accent-soft p-4 text-sm">
              <p className="text-foreground/60 mb-2">
                {m.source === "designer" ? "Taken at fitting" : "Submitted by client"}
                {m.verified ? " · verified" : ""} · {new Date(m.taken_at).toLocaleDateString()}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1">
                {[
                  ["Bust", m.bust],
                  ["Waist", m.waist],
                  ["Hip", m.hip],
                  ["Shoulder", m.shoulder],
                  ["Sleeve", m.sleeve_length],
                  ["Back", m.back_length],
                  ["Inseam", m.inseam],
                ].map(([label, value]) =>
                  value != null ? (
                    <p key={label as string}>
                      {label}: {value}&quot;
                    </p>
                  ) : null
                )}
              </div>
              {m.notes && <p className="mt-2 text-foreground/70">{m.notes}</p>}
            </div>
          ))}
          {measurementList.length === 0 && (
            <p className="text-foreground/60">No measurements on file.</p>
          )}
        </div>
      </section>
    </div>
  );
}
