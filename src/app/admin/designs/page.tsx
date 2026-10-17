import { createClient } from "@/lib/supabase/server";
import { ImageUploadField } from "@/components/ImageUploadField";
import { createDesign, toggleDesignActive } from "./actions";
import type { Design } from "@/types/db";

export default async function AdminDesignsPage() {
  const supabase = await createClient();
  const { data: designs } = await supabase
    .from("designs")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-10">
      <section>
        <h1 className="font-serif text-2xl mb-4">Add a design</h1>
        <form action={createDesign} className="space-y-3 max-w-md">
          <input
            name="title"
            required
            placeholder="Title"
            className="w-full rounded-md border border-accent-soft px-3 py-2"
          />
          <select
            name="category"
            className="w-full rounded-md border border-accent-soft px-3 py-2"
          >
            <option value="bridal">Bridal</option>
            <option value="aso_ebi">Aso-ebi</option>
            <option value="casual">Casual</option>
            <option value="men">Men&apos;s</option>
            <option value="other">Other</option>
          </select>
          <textarea
            name="description"
            placeholder="Description"
            className="w-full rounded-md border border-accent-soft px-3 py-2"
            rows={3}
          />
          <input
            name="labourPrice"
            type="number"
            required
            placeholder="Labour price (₦)"
            className="w-full rounded-md border border-accent-soft px-3 py-2"
          />
          <input
            name="estimatedYards"
            type="number"
            step="0.1"
            placeholder="Estimated yards (optional)"
            className="w-full rounded-md border border-accent-soft px-3 py-2"
          />
          <ImageUploadField name="coverPhotoUrl" />
          <button type="submit" className="rounded-full bg-accent text-white px-6 py-2">
            Save design
          </button>
        </form>
      </section>

      <section>
        <h2 className="font-serif text-xl mb-4">All designs</h2>
        <div className="space-y-2">
          {((designs ?? []) as Design[]).map((d) => (
            <div
              key={d.id}
              className="rounded-lg border border-accent-soft p-4 flex items-center justify-between gap-3"
            >
              <div>
                <p className="font-medium">
                  {d.reference} — {d.title}
                </p>
                <p className="text-sm text-foreground/60">
                  {d.category} · ₦{d.labour_price.toLocaleString()} ·{" "}
                  {d.active ? "active" : "hidden"}
                </p>
              </div>
              <form action={toggleDesignActive}>
                <input type="hidden" name="designId" value={d.id} />
                <input type="hidden" name="active" value={String(d.active)} />
                <button type="submit" className="text-sm underline">
                  {d.active ? "Hide" : "Show"}
                </button>
              </form>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
