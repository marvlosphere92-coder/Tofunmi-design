import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ImageUploadField } from "@/components/ImageUploadField";
import { BulkImageUploadField } from "@/components/BulkImageUploadField";
import { createDesign, toggleDesignActive, moveDesign, createDraftDesigns } from "./actions";
import type { Design } from "@/types/db";

export default async function AdminDesignsPage() {
  const supabase = await createClient();
  const { data: designs } = await supabase
    .from("designs")
    .select("*")
    .order("display_order", { ascending: true });

  const list = (designs ?? []) as Design[];

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
            placeholder="Labour price (₦) — optional, leave blank if not set yet"
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
        <h2 className="font-serif text-xl mb-4">Bulk add from a photoshoot</h2>
        <form action={createDraftDesigns} className="max-w-md space-y-3">
          <BulkImageUploadField />
          <button type="submit" className="rounded-full bg-accent text-white px-6 py-2">
            Create draft designs
          </button>
        </form>
      </section>

      <section>
        <h2 className="font-serif text-xl mb-4">All designs</h2>
        <div className="space-y-2">
          {list.map((d, i) => (
            <div
              key={d.id}
              className="rounded-lg border border-accent-soft p-4 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <form action={moveDesign}>
                    <input type="hidden" name="designId" value={d.id} />
                    <input type="hidden" name="direction" value="up" />
                    <button
                      type="submit"
                      disabled={i === 0}
                      className="text-xs leading-none px-1.5 py-1 disabled:opacity-20"
                      aria-label="Move up"
                    >
                      ▲
                    </button>
                  </form>
                  <form action={moveDesign}>
                    <input type="hidden" name="designId" value={d.id} />
                    <input type="hidden" name="direction" value="down" />
                    <button
                      type="submit"
                      disabled={i === list.length - 1}
                      className="text-xs leading-none px-1.5 py-1 disabled:opacity-20"
                      aria-label="Move down"
                    >
                      ▼
                    </button>
                  </form>
                </div>
                <div>
                  <p className="font-medium">
                    {d.reference} — {d.title}
                    {!d.active && d.title === "Untitled design" && (
                      <span className="ml-2 text-xs text-accent">draft</span>
                    )}
                  </p>
                  <p className="text-sm text-foreground/60">
                    {d.category}
                    {d.labour_price != null ? ` · ₦${d.labour_price.toLocaleString()}` : " · price not set"} ·{" "}
                    {d.active ? "active" : "hidden"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Link href={`/admin/designs/${d.id}/edit`} className="text-sm underline">
                  Edit
                </Link>
                <form action={toggleDesignActive}>
                  <input type="hidden" name="designId" value={d.id} />
                  <input type="hidden" name="active" value={String(d.active)} />
                  <button type="submit" className="text-sm underline">
                    {d.active ? "Hide" : "Show"}
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
