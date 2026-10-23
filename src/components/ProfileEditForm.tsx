"use client";

import { useState } from "react";
import { SubmitButton } from "@/components/SubmitButton";

export function ProfileEditForm({
  fullName,
  phone,
  action,
}: {
  fullName: string;
  phone: string | null;
  action: (formData: FormData) => void;
}) {
  const [editing, setEditing] = useState(false);

  if (!editing) {
    return (
      <div className="flex items-center justify-between gap-4 text-sm">
        <p className="text-foreground/70">
          {phone ? phone : <span className="text-foreground/70">No phone number on file</span>}
        </p>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="underline transition hover:opacity-70"
        >
          Edit
        </button>
      </div>
    );
  }

  return (
    <form
      action={(formData) => {
        action(formData);
        setEditing(false);
      }}
      className="flex flex-wrap items-end gap-2"
    >
      <label className="text-xs text-foreground/70">
        Full name
        <input
          name="fullName"
          defaultValue={fullName}
          required
          className="block rounded-md border border-accent-soft px-3 py-2 text-sm mt-1"
        />
      </label>
      <label className="text-xs text-foreground/70">
        Phone (WhatsApp)
        <input
          name="phone"
          defaultValue={phone ?? ""}
          placeholder="e.g. 2348012345678"
          className="block rounded-md border border-accent-soft px-3 py-2 text-sm mt-1"
        />
      </label>
      <SubmitButton className="rounded-full bg-accent text-white px-4 py-2 text-sm" pendingText="Saving…">
        Save
      </SubmitButton>
      <button
        type="button"
        onClick={() => setEditing(false)}
        className="text-sm underline transition hover:opacity-70"
      >
        Cancel
      </button>
    </form>
  );
}
