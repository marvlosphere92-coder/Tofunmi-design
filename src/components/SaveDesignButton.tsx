"use client";

import { useState, useTransition } from "react";
import { toggleSavedDesign } from "@/app/account/actions";

export function SaveDesignButton({
  designId,
  initialSaved,
  signedIn,
}: {
  designId: string;
  initialSaved: boolean;
  signedIn: boolean;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [pending, startTransition] = useTransition();

  if (!signedIn) {
    return (
      <a
        href="/account"
        className="inline-flex items-center gap-2 rounded-full border border-accent-soft px-4 py-2 text-sm transition hover:bg-accent-soft active:scale-95"
        title="Sign in to save this design"
      >
        <HeartIcon filled={false} />
        Save
      </a>
    );
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        const next = !saved;
        setSaved(next);
        startTransition(async () => {
          const formData = new FormData();
          formData.set("designId", designId);
          formData.set("saved", String(saved));
          try {
            await toggleSavedDesign(formData);
          } catch {
            setSaved(!next);
          }
        });
      }}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition active:scale-95 disabled:opacity-60 ${
        saved
          ? "bg-accent border-accent text-white hover:opacity-90"
          : "border-accent-soft hover:bg-accent-soft"
      }`}
    >
      <HeartIcon filled={saved} />
      {saved ? "Saved" : "Save"}
    </button>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      className="w-4 h-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 20.5s-7.5-4.6-10-9.3C.4 7.8 2.3 4.5 5.7 4c2-.3 3.9.6 5.1 2.2a1.5 1.5 0 0 0 2.4 0C14.4 4.6 16.3 3.7 18.3 4c3.4.5 5.3 3.8 3.7 7.2-2.5 4.7-10 9.3-10 9.3Z"
      />
    </svg>
  );
}
