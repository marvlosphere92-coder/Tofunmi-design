import { createClient } from "@/lib/supabase/server";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { ReviewsGrid } from "@/components/ReviewsGrid";
import type { Review } from "@/types/db";

export const metadata = {
  title: "Reviews | SimplyBukky",
};

export default async function ReviewsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });

  const reviews = (data ?? []) as Review[];
  const average = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <>
      <SiteNav />
      <main className="flex-1 mx-auto max-w-4xl px-6 py-16 w-full">
        <h1 className="font-serif text-2xl mb-2">Reviews</h1>
        {average && (
          <p className="text-sm text-foreground/60 mb-8">
            {average} average · {reviews.length} review{reviews.length === 1 ? "" : "s"}
          </p>
        )}
        <ReviewsGrid reviews={reviews} />
      </main>
      <SiteFooter />
    </>
  );
}
