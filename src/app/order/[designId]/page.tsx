import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { submitOrder } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";
import { OrderFabricFields } from "@/components/OrderFabricFields";
import { OrderMeasurementFields } from "@/components/OrderMeasurementFields";
import type { Design, Material } from "@/types/db";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ designId: string }>;
}) {
  const { designId } = await params;
  const supabase = await createClient();

  const [{ data: design }, { data: materials }] = await Promise.all([
    supabase.from("designs").select("*").eq("id", designId).single(),
    supabase.from("materials").select("*").eq("in_stock", true),
  ]);

  if (!design) notFound();
  const d = design as Design;
  const mats = (materials ?? []) as Material[];

  // At least the 2–3 week typical turnaround out from today.
  const minDeliveryDate = new Date();
  minDeliveryDate.setDate(minDeliveryDate.getDate() + 14);
  const minDeliveryDateStr = minDeliveryDate.toISOString().split("T")[0];

  return (
    <>
      <SiteNav />
      <main className="flex-1 mx-auto max-w-xl px-6 py-12 w-full">
        <h1 className="font-serif text-2xl">Request: {d.title}</h1>
        {(d.labour_price != null || d.estimated_yards) && (
          <p className="text-sm text-foreground/70 mt-1">
            {d.labour_price != null ? `Labour from ₦${d.labour_price.toLocaleString()}` : ""}
            {d.labour_price != null && d.estimated_yards ? " · " : ""}
            {d.estimated_yards ? `~${d.estimated_yards} yards` : ""}
          </p>
        )}

        <form action={submitOrder} className="mt-8 space-y-6">
          <input type="hidden" name="designId" value={d.id} />

          <fieldset className="space-y-3">
            <legend className="font-medium">Your details</legend>
            <label className="block text-sm font-medium" htmlFor="fullName">
              Full name
              <input
                id="fullName"
                name="fullName"
                required
                autoComplete="name"
                placeholder="e.g. Amaka Okafor"
                className="block w-full rounded-md border border-accent-soft px-3 py-2 text-base mt-1 font-normal"
              />
            </label>
            <label className="block text-sm font-medium" htmlFor="phone">
              Phone (WhatsApp number)
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                autoComplete="tel"
                inputMode="tel"
                placeholder="e.g. 2348012345678"
                className="block w-full rounded-md border border-accent-soft px-3 py-2 text-base mt-1 font-normal"
              />
            </label>
            <label className="block text-sm font-medium" htmlFor="email">
              Email (optional)
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="e.g. amaka@example.com"
                className="block w-full rounded-md border border-accent-soft px-3 py-2 text-base mt-1 font-normal"
              />
            </label>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="font-medium">Fabric</legend>
            <OrderFabricFields materials={mats} />
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="font-medium">Measurements</legend>
            <OrderMeasurementFields />
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="font-medium">Delivery details</legend>
            <label className="block text-sm font-medium" htmlFor="eventDate">
              When do you need this ready by? (your delivery date)
              <input
                id="eventDate"
                name="eventDate"
                type="date"
                required
                min={minDeliveryDateStr}
                className="block w-full rounded-md border border-accent-soft px-3 py-2 text-base mt-1 font-normal"
              />
            </label>
            <p className="text-xs text-foreground/70">
              We typically need at least 2–3 weeks to make a piece properly.
            </p>
            <label className="block text-sm font-medium" htmlFor="budgetNote">
              Anything else?
              <textarea
                id="budgetNote"
                name="budgetNote"
                placeholder="Budget, inspiration, special requests…"
                className="block w-full rounded-md border border-accent-soft px-3 py-2 text-base mt-1 font-normal"
                rows={3}
              />
            </label>
          </fieldset>

          <SubmitButton
            className="w-full rounded-full bg-accent text-white py-3 shadow-sm hover:shadow-lg"
            pendingText="Sending…"
          >
            Send request
          </SubmitButton>
        </form>
      </main>
      <SiteFooter />
    </>
  );
}
