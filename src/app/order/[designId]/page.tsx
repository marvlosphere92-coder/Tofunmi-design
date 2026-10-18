import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { submitOrder } from "./actions";
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

  return (
    <>
      <SiteNav />
      <main className="flex-1 mx-auto max-w-xl px-6 py-12 w-full">
        <h1 className="font-serif text-2xl">Request: {d.title}</h1>
        {(d.labour_price != null || d.estimated_yards) && (
          <p className="text-sm text-foreground/60 mt-1">
            {d.labour_price != null ? `Labour from ₦${d.labour_price.toLocaleString()}` : ""}
            {d.labour_price != null && d.estimated_yards ? " · " : ""}
            {d.estimated_yards ? `~${d.estimated_yards} yards` : ""}
          </p>
        )}

        <form action={submitOrder} className="mt-8 space-y-6">
          <input type="hidden" name="designId" value={d.id} />

          <fieldset className="space-y-3">
            <legend className="font-medium">Your details</legend>
            <input
              name="fullName"
              required
              placeholder="Full name"
              className="w-full rounded-md border border-accent-soft px-3 py-2"
            />
            <input
              name="phone"
              required
              placeholder="Phone (WhatsApp number)"
              className="w-full rounded-md border border-accent-soft px-3 py-2"
            />
            <input
              name="email"
              type="email"
              placeholder="Email (optional)"
              className="w-full rounded-md border border-accent-soft px-3 py-2"
            />
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="font-medium">Fabric</legend>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="ownFabric" id="ownFabric" />
              I&apos;ll bring my own fabric
            </label>
            <select
              name="materialId"
              className="w-full rounded-md border border-accent-soft px-3 py-2"
            >
              <option value="">Choose a fabric from her catalog</option>
              {mats.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} — ₦{m.price_per_yard.toLocaleString()}/yard
                </option>
              ))}
            </select>
            <p className="text-xs text-foreground/60">
              Final price depends on exact yardage needed for your size —
              she&apos;ll confirm before the deposit.
            </p>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="font-medium">Measurements</legend>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="measurementChoice" value="designer" defaultChecked />
              She&apos;ll measure me herself at a fitting
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="measurementChoice" value="client" />
              I&apos;ll submit my own measurements now
            </label>

            <div className="grid grid-cols-2 gap-3 pt-2">
              {[
                ["bust", "Bust (in)"],
                ["waist", "Waist (in)"],
                ["hip", "Hip (in)"],
                ["shoulder", "Shoulder (in)"],
                ["sleeveLength", "Sleeve length (in)"],
                ["backLength", "Back length (in)"],
                ["inseam", "Inseam (in)"],
              ].map(([name, label]) => (
                <input
                  key={name}
                  name={name}
                  type="number"
                  step="0.1"
                  placeholder={label}
                  className="rounded-md border border-accent-soft px-3 py-2 text-sm"
                />
              ))}
            </div>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="font-medium">Event details</legend>
            <label className="block text-sm text-foreground/70" htmlFor="eventDate">
              When do you need to wear this? (wedding date, owambe, etc. — not a delivery date)
            </label>
            <input
              id="eventDate"
              name="eventDate"
              type="date"
              className="w-full rounded-md border border-accent-soft px-3 py-2"
            />
            <textarea
              name="budgetNote"
              placeholder="Anything else — budget, inspiration, special requests"
              className="w-full rounded-md border border-accent-soft px-3 py-2"
              rows={3}
            />
          </fieldset>

          <button
            type="submit"
            className="w-full rounded-full bg-accent text-white py-3"
          >
            Send request
          </button>
        </form>
      </main>
      <SiteFooter />
    </>
  );
}
