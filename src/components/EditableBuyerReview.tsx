"use client";

import { useState } from "react";
import { StarRating } from "@/components/StarRating";
import { SinglePhotoUploadField } from "@/components/SinglePhotoUploadField";
import { SubmitButton } from "@/components/SubmitButton";
import type { Review } from "@/types/db";

export function EditableBuyerReview({
  review,
  action,
}: {
  review: Review;
  action: (formData: FormData) => void;
}) {
  const [editing, setEditing] = useState(false);

  if (!editing) {
    return (
      <div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium">Your review</p>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-xs underline transition hover:opacity-70"
          >
            Edit
          </button>
        </div>
        <StarRating rating={review.rating} className="text-sm" />
        {review.body && <p className="mt-1 text-sm text-foreground/70">{review.body}</p>}
        {review.photo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={review.photo_url} alt="" className="mt-2 w-20 h-20 rounded-md object-cover" />
        )}
      </div>
    );
  }

  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="reviewId" value={review.id} />
      <p className="text-sm font-medium">Edit your review</p>
      <select
        key={review.rating}
        name="rating"
        required
        defaultValue={review.rating}
        className="rounded-md border border-accent-soft px-3 py-2 text-sm"
      >
        {[5, 4, 3, 2, 1].map((n) => (
          <option key={n} value={n}>
            {n} star{n === 1 ? "" : "s"}
          </option>
        ))}
      </select>
      <textarea
        name="body"
        defaultValue={review.body ?? ""}
        placeholder="How was it?"
        className="w-full rounded-md border border-accent-soft px-3 py-2 text-sm"
        rows={2}
      />
      <SinglePhotoUploadField initialPhoto={review.photo_url} />
      <div className="flex items-center gap-3">
        <SubmitButton
          className="rounded-full bg-accent text-white px-5 py-2 text-sm"
          pendingText="Saving…"
        >
          Save changes
        </SubmitButton>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="text-sm underline transition hover:opacity-70"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
