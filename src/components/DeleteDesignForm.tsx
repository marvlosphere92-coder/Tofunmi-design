"use client";

import { SubmitButton } from "@/components/SubmitButton";

export function DeleteDesignForm({
  action,
  designId,
  title,
}: {
  action: (formData: FormData) => void;
  designId: string;
  title: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(`Delete "${title}"? This can't be undone.`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="designId" value={designId} />
      <SubmitButton
        className="text-sm underline text-red-700 transition hover:opacity-70"
        pendingText="Deleting…"
      >
        Delete
      </SubmitButton>
    </form>
  );
}
