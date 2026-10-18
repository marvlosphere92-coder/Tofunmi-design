import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ImageUploadField } from "@/components/ImageUploadField";
import { updateDesign } from "../../actions";
import type { Design } from "@/types/db";

export default async function EditDesignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("designs").select("*").eq("id", id).single();

  if (!data) notFound();
  const d = data as Design;

  return (
    <div>
      <h1 className="font-serif text-2xl mb-6">
        Edit: {d.reference} — {d.title}
      </h1>
      <form action={updateDesign} className="space-y-3 max-w-md">
        <input type="hidden" name="designId" value={d.id} />
        <input
          name="title"
          required
          defaultValue={d.title}
          placeholder="Title"
          className="w-full rounded-md border border-accent-soft px-3 py-2"
        />
        <select
          name="category"
          defaultValue={d.category}
          className="w-full rounded-md border border-accent-soft px-3 py-2"
        >
          <option value="bridal">Bridal</option>
          <option value="aso_ebi">Aso-ebi</option>
          <option value="casual">Casual</option>
          <option value="other">Other</option>
        </select>
        <textarea
          name="description"
          defaultValue={d.description ?? ""}
          placeholder="Description"
          className="w-full rounded-md border border-accent-soft px-3 py-2"
          rows={3}
        />
        <input
          name="labourPrice"
          type="number"
          defaultValue={d.labour_price ?? ""}
          placeholder="Labour price (₦) — optional, leave blank if not set yet"
          className="w-full rounded-md border border-accent-soft px-3 py-2"
        />
        <input
          name="estimatedYards"
          type="number"
          step="0.1"
          defaultValue={d.estimated_yards ?? ""}
          placeholder="Estimated yards (optional)"
          className="w-full rounded-md border border-accent-soft px-3 py-2"
        />
        <ImageUploadField name="coverPhotoUrl" initialUrl={d.cover_photo_url} />
        <button type="submit" className="rounded-full bg-accent text-white px-6 py-2">
          Save changes
        </button>
      </form>
    </div>
  );
}
