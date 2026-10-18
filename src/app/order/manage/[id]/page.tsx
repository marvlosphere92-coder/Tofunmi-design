import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { updateOrderByClient } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";

export default async function ManageOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createServiceClient();

  const { data: order } = await supabase
    .from("orders")
    .select("id, reference, status, event_date, budget_note, designs(title)")
    .eq("id", id)
    .single();

  if (!order) notFound();
  const design = order.designs as unknown as { title: string } | null;

  return (
    <>
      <SiteNav />
      <main className="flex-1 mx-auto max-w-lg px-6 py-16 w-full">
        <h1 className="font-serif text-2xl">Manage order {order.reference}</h1>
        <p className="mt-2 text-sm text-foreground/60">
          {design?.title ?? "—"} · status: {order.status.replace(/_/g, " ")}
        </p>

        <form action={updateOrderByClient} className="mt-8 space-y-4">
          <input type="hidden" name="orderId" value={order.id} />
          <div>
            <label className="block text-sm text-foreground/70 mb-1" htmlFor="eventDate">
              Delivery date (when you need this ready by)
            </label>
            <input
              id="eventDate"
              type="date"
              name="eventDate"
              defaultValue={order.event_date ?? ""}
              className="w-full rounded-md border border-accent-soft px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm text-foreground/70 mb-1" htmlFor="budgetNote">
              Notes
            </label>
            <textarea
              id="budgetNote"
              name="budgetNote"
              defaultValue={order.budget_note ?? ""}
              rows={3}
              className="w-full rounded-md border border-accent-soft px-3 py-2"
            />
          </div>
          <SubmitButton className="rounded-full bg-accent text-white px-6 py-3" pendingText="Saving…">
            Save changes
          </SubmitButton>
        </form>

        <p className="mt-6 text-xs text-foreground/60">
          For anything else — fabric, pricing, measurements — message us directly on WhatsApp.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
