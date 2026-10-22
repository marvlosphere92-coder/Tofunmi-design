import { StarRating } from "@/components/StarRating";
import type { Review } from "@/types/db";

export function ReviewsGrid({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return <p className="text-foreground/60">No reviews yet.</p>;
  }

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {reviews.map((r) => (
        <div
          key={r.id}
          className="rounded-lg bg-surface shadow-sm p-5 transition duration-300 hover:shadow-lg hover:-translate-y-1"
        >
          <StarRating rating={r.rating} />
          {r.body && <p className="mt-2 text-sm text-foreground/80 leading-relaxed">{r.body}</p>}
          {r.photo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={r.photo_url}
              alt=""
              className="mt-3 w-24 h-24 rounded-md object-cover"
            />
          )}
          <p className="mt-3 text-xs text-foreground/50">
            {r.reviewer_name} · {new Date(r.created_at).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
}
