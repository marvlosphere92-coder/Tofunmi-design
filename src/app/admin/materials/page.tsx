import { createClient } from "@/lib/supabase/server";
import { createMaterial, updateMaterial } from "./actions";
import type { Material } from "@/types/db";

export default async function AdminMaterialsPage() {
  const supabase = await createClient();
  const { data: materials } = await supabase
    .from("materials")
    .select("*")
    .order("name", { ascending: true });

  return (
    <div className="space-y-10">
      <section>
        <h1 className="font-serif text-2xl mb-4">Add a material</h1>
        <form action={createMaterial} className="space-y-3 max-w-md">
          <input
            name="name"
            required
            placeholder="Name (e.g. Emerald Silk Satin)"
            className="w-full rounded-md border border-accent-soft px-3 py-2"
          />
          <input
            name="type"
            placeholder="Type (e.g. silk, ankara, lace) — optional"
            className="w-full rounded-md border border-accent-soft px-3 py-2"
          />
          <input
            name="pricePerYard"
            type="number"
            required
            placeholder="Price per yard (₦)"
            className="w-full rounded-md border border-accent-soft px-3 py-2"
          />
          <button type="submit" className="rounded-full bg-accent text-white px-6 py-2">
            Save material
          </button>
        </form>
      </section>

      <section>
        <h2 className="font-serif text-xl mb-4">All materials</h2>
        <div className="space-y-2">
          {((materials ?? []) as Material[]).map((m) => (
            <form
              key={m.id}
              action={updateMaterial}
              className="rounded-lg border border-accent-soft p-4 flex flex-wrap items-end gap-3"
            >
              <input type="hidden" name="materialId" value={m.id} />
              <label className="text-xs text-foreground/60">
                Name
                <input
                  name="name"
                  defaultValue={m.name}
                  className="block rounded-md border border-accent-soft px-2 py-1 text-sm mt-1"
                />
              </label>
              <label className="text-xs text-foreground/60">
                Type
                <input
                  name="type"
                  defaultValue={m.type ?? ""}
                  className="block rounded-md border border-accent-soft px-2 py-1 text-sm mt-1 w-28"
                />
              </label>
              <label className="text-xs text-foreground/60">
                ₦/yard
                <input
                  name="pricePerYard"
                  type="number"
                  defaultValue={m.price_per_yard}
                  className="block rounded-md border border-accent-soft px-2 py-1 text-sm mt-1 w-24"
                />
              </label>
              <label className="flex items-center gap-1 text-xs text-foreground/60">
                <input type="checkbox" name="inStock" defaultChecked={m.in_stock} />
                In stock
              </label>
              <button
                type="submit"
                className="rounded-full border border-accent-soft px-4 py-1 text-sm"
              >
                Save
              </button>
            </form>
          ))}
          {(!materials || materials.length === 0) && (
            <p className="text-foreground/60">No materials yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
