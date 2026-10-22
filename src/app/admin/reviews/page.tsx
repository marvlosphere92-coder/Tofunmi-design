import { createClient } from "@/lib/supabase/server";
import { SubmitButton } from "@/components/SubmitButton";
import { SinglePhotoUploadField } from "@/components/SinglePhotoUploadField";
import { ConfirmDeleteForm } from "@/components/ConfirmDeleteForm";
import { createAdminReview, updateReview, toggleReviewPublished, deleteReview } from "./actions";
import type { Design, Review } from "@/types/db";

export default async function AdminReviewsPage() {
  const supabase = await createClient();
  const [{ data: reviews }, { data: designs }] = await Promise.all([
    supabase.from("reviews").select("*").order("created_at", { ascending: false }),
    supabase.from("designs").select("id, title").order("title", { ascending: true }),
  ]);

  const list = (reviews ?? []) as Review[];
  const designList = (designs ?? []) as Pick<Design, "id" | "title">[];

  return (
    <div className="space-y-10">
      <section>
        <h1 className="font-serif text-2xl mb-4">Add a review</h1>
        <p className="text-sm text-foreground/60 mb-4">
          For clients who ordered through WhatsApp or in person — not through the site.
        </p>
        <form action={createAdminReview} className="space-y-3 max-w-md">
          <input
            name="reviewerName"
            required
            placeholder="Client name"
            className="w-full rounded-md border border-accent-soft px-3 py-2"
          />
          <select name="rating" required defaultValue="5" className="w-full rounded-md border border-accent-soft px-3 py-2">
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} star{n === 1 ? "" : "s"}
              </option>
            ))}
          </select>
          <select name="designId" className="w-full rounded-md border border-accent-soft px-3 py-2">
            <option value="">Not linked to a specific design (optional)</option>
            {designList.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title}
              </option>
            ))}
          </select>
          <textarea
            name="body"
            placeholder="What they said"
            className="w-full rounded-md border border-accent-soft px-3 py-2"
            rows={3}
          />
          <SinglePhotoUploadField />
          <SubmitButton className="rounded-full bg-accent text-white px-6 py-2" pendingText="Saving…">
            Save review
          </SubmitButton>
        </form>
      </section>

      <section>
        <h2 className="font-serif text-xl mb-4">All reviews</h2>
        <div className="space-y-2">
          {list.map((r) => (
            <div key={r.id} className="rounded-lg border border-accent-soft p-4 space-y-3">
              <p className="text-xs text-foreground/50">
                {r.source === "admin" ? "Added by admin" : "From a buyer"} ·{" "}
                {r.published ? "Published" : "Hidden"} · {new Date(r.created_at).toLocaleDateString()}
              </p>
              <form action={updateReview} className="flex flex-wrap items-end gap-2">
                <input type="hidden" name="reviewId" value={r.id} />
                <label className="text-xs text-foreground/60">
                  Name
                  <input
                    name="reviewerName"
                    defaultValue={r.reviewer_name}
                    className="block rounded-md border border-accent-soft px-2 py-1 text-sm mt-1"
                  />
                </label>
                <label className="text-xs text-foreground/60">
                  Rating
                  <select
                    key={r.rating}
                    name="rating"
                    defaultValue={r.rating}
                    className="block rounded-md border border-accent-soft px-2 py-1 text-sm mt-1"
                  >
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>
                        {n} star{n === 1 ? "" : "s"}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-xs text-foreground/60 flex-1 min-w-[200px]">
                  What they said
                  <input
                    name="body"
                    defaultValue={r.body ?? ""}
                    className="block w-full rounded-md border border-accent-soft px-2 py-1 text-sm mt-1"
                  />
                </label>
                <SubmitButton
                  className="rounded-full border border-accent-soft px-4 py-1 text-sm"
                  pendingText="Saving…"
                >
                  Save
                </SubmitButton>
              </form>
              <div className="flex items-center gap-4">
                <form action={toggleReviewPublished}>
                  <input type="hidden" name="reviewId" value={r.id} />
                  <input type="hidden" name="published" value={String(r.published)} />
                  <SubmitButton className="text-sm underline" pendingText="…">
                    {r.published ? "Hide" : "Publish"}
                  </SubmitButton>
                </form>
                <ConfirmDeleteForm
                  action={deleteReview}
                  hiddenFields={{ reviewId: r.id }}
                  confirmMessage={`Delete the review from ${r.reviewer_name}?`}
                />
              </div>
            </div>
          ))}
          {list.length === 0 && <p className="text-foreground/60">No reviews yet.</p>}
        </div>
      </section>
    </div>
  );
}
