export function StarRating({ rating, className }: { rating: number; className?: string }) {
  return (
    <span className={`text-accent ${className ?? ""}`} aria-label={`${rating} out of 5 stars`}>
      {"★".repeat(rating)}
      <span className="text-accent-soft">{"★".repeat(5 - rating)}</span>
    </span>
  );
}
