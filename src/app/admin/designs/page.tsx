import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DesignMediaUploadField } from "@/components/DesignMediaUploadField";
import { SubmitButton } from "@/components/SubmitButton";
import { ConfirmDeleteForm } from "@/components/ConfirmDeleteForm";
import { createDesign, toggleDesignActive, moveDesign, deleteDesign } from "./actions";
import { SUGGESTED_CATEGORIES } from "@/types/db";
import type { Design } from "@/types/db";

export default async function AdminDesignsPage() {
  const supabase = await createClient();
  const [{ data: designs }, { data: orders }] = await Promise.all([
    supabase.from("designs").select("*").order("display_order", { ascending: true }),
    supabase.from("orders").select("design_id"),
  ]);

  const list = (designs ?? []) as Design[];
  const orderCounts: Record<string, number> = {};
  for (const o of orders ?? []) {
    if (!o.design_id) continue;
    orderCounts[o.design_id] = (orderCounts[o.design_id] ?? 0) + 1;
  }

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
          <input
            name="category"
            list="category-suggestions"
            placeholder="Category (type anything — e.g. Owambe, Native wear)"
            className="w-full rounded-md border border-accent-soft px-3 py-2"
          />
          <datalist id="category-suggestions">
            {SUGGESTED_CATEGORIES.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
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
          <DesignMediaUploadField />
          <div className="flex gap-3">
            <SubmitButton
              name="intent"
              value="publish"
              className="rounded-full bg-accent text-white px-6 py-2"
              pendingText="Saving…"
            >
              Save design
            </SubmitButton>
            <SubmitButton
              name="intent"
              value="draft"
              className="rounded-full border border-accent-soft px-6 py-2"
              pendingText="Saving…"
            >
              Save as draft
            </SubmitButton>
          </div>
          <p className="text-xs text-foreground/70">
            A draft is saved hidden from the lookbook until you&apos;re ready to publish it.
          </p>
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
                    <SubmitButton
                      disabled={i === 0}
                      className="text-xs leading-none px-1.5 py-1 disabled:opacity-20"
                      aria-label="Move up"
                      pendingText="…"
                    >
                      ▲
                    </SubmitButton>
                  </form>
                  <form action={moveDesign}>
                    <input type="hidden" name="designId" value={d.id} />
                    <input type="hidden" name="direction" value="down" />
                    <SubmitButton
                      disabled={i === list.length - 1}
                      className="text-xs leading-none px-1.5 py-1 disabled:opacity-20"
                      aria-label="Move down"
                      pendingText="…"
                    >
                      ▼
                    </SubmitButton>
                  </form>
                </div>
                {d.cover_photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={d.cover_photo_url}
                    alt=""
                    className="w-14 h-14 rounded-md object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-md bg-accent-soft flex-shrink-0" />
                )}
                <div>
                  <p className="font-medium flex items-center gap-2 flex-wrap">
                    {d.reference} — {d.title}
                    {!d.active && <span className="text-xs text-accent">draft</span>}
                    {orderCounts[d.id] > 0 && (
                      <span
                        className="inline-flex items-center gap-1 rounded-full bg-gold-soft text-foreground/80 text-xs px-2 py-0.5"
                        title={`Ordered ${orderCounts[d.id]} time${orderCounts[d.id] === 1 ? "" : "s"}`}
                      >
                        <BagIcon />
                        {orderCounts[d.id]}
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-foreground/70">
                    {d.category}
                    {d.labour_price != null ? ` · ₦${d.labour_price.toLocaleString()}` : " · price not set"} ·{" "}
                    {d.active ? "active" : "hidden"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Link
                  href={`/admin/designs/${d.id}/edit`}
                  className="text-sm underline transition hover:opacity-70"
                >
                  Edit
                </Link>
                <form action={toggleDesignActive}>
                  <input type="hidden" name="designId" value={d.id} />
                  <input type="hidden" name="active" value={String(d.active)} />
                  <SubmitButton className="text-sm underline" pendingText="…">
                    {d.active ? "Hide" : "Show"}
                  </SubmitButton>
                </form>
                <ConfirmDeleteForm
                  action={deleteDesign}
                  hiddenFields={{ designId: d.id }}
                  confirmMessage={`Delete "${d.title}"? This can't be undone.`}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12l1 13H5L6 7Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 10V6a3 3 0 0 1 6 0v4" />
    </svg>
  );
}
