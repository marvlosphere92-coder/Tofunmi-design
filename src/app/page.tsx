import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { HeroReveal } from "@/components/HeroReveal";
import { DesignCard } from "@/components/DesignCard";
import { FadeIn } from "@/components/FadeIn";
import { CategoryTiles, type CategoryTile } from "@/components/CategoryTiles";
import { StatsStrip } from "@/components/StatsStrip";
import { EditorialBreak } from "@/components/EditorialBreak";
import { ReviewsGrid } from "@/components/ReviewsGrid";
import { sortCategories } from "@/lib/categories";
import type { CapacitySettings, Design, Review } from "@/types/db";

export default async function Home() {
  const supabase = await createClient();

  const [{ data: designs }, { data: capacity }, { data: reviews }] = await Promise.all([
    supabase
      .from("designs")
      .select("*")
      .eq("active", true)
      .order("display_order", { ascending: true })
      .limit(8),
    supabase.from("capacity_settings").select("*").single(),
    supabase
      .from("reviews")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(4),
  ]);

  const featured = (designs ?? []) as Design[];
  const cap = capacity as CapacitySettings | null;
  const recentReviews = (reviews ?? []) as Review[];

  // Build one homepage tile per category that has at least one active,
  // real-photo design — avoids linking to an empty category and never
  // falls back to a stock photo.
  const categoriesWithPhotos = new Map<string, string>();
  for (const d of featured) {
    if (d.cover_photo_url && !categoriesWithPhotos.has(d.category)) {
      categoriesWithPhotos.set(d.category, d.cover_photo_url);
    }
  }
  const categoryTiles: CategoryTile[] = sortCategories(
    Array.from(categoriesWithPhotos.keys())
  ).map((category) => ({ category, image: categoriesWithPhotos.get(category)! }));

  return (
    <>
      <SiteNav />
      <main className="flex-1">
        <div className="relative h-[82vh] min-h-[480px] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1789589725465-4c9bc560b21f?auto=format&fit=crop&w=2000&q=80"
            alt="A group of women in matching ankara skirts and cream tops at golden hour"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/20" />
          <HeroReveal
            title={
              <>
                Bespoke fashion,
                <br /> made just for you
              </>
            }
            cta={{ href: "/designs", label: "View the Lookbook" }}
            extra={
              cap &&
              !cap.accepting_orders && (
                <p className="mt-4 text-sm text-white/90">
                  Currently fully booked
                  {cap.booked_until
                    ? ` until ${new Date(cap.booked_until).toLocaleDateString()}`
                    : ""}
                  . <Link href="/waitlist" className="underline transition hover:opacity-70">Join the waitlist</Link>
                </p>
              )
            }
          />
        </div>

        <StatsStrip />
        <CategoryTiles tiles={categoryTiles} />
        <EditorialBreak />

        {featured.length > 0 && (
          <section className="mx-auto max-w-6xl px-6 py-16">
            <p className="text-center text-xs uppercase tracking-[0.2em] text-accent mb-2">
              Fresh off the machine
            </p>
            <h2 className="font-serif text-2xl mb-8 text-center">From the lookbook</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featured.map((d, i) => (
                <DesignCard key={d.id} design={d} index={i} />
              ))}
            </div>
            <FadeIn className="text-center mt-10">
              <Link
                href="/designs"
                className="inline-block rounded-full border border-accent text-accent px-6 py-2.5 text-sm transition hover:bg-accent hover:text-white"
              >
                See the full lookbook
              </Link>
            </FadeIn>
          </section>
        )}

        {recentReviews.length > 0 && (
          <section className="bg-gold-soft/60 py-16">
            <div className="mx-auto max-w-6xl px-6">
              <p className="text-center text-xs uppercase tracking-[0.2em] text-accent mb-2">
                Loved by clients
              </p>
              <h2 className="font-serif text-2xl mb-8 text-center">What our clients say</h2>
              <ReviewsGrid reviews={recentReviews} />
              <FadeIn className="text-center mt-10">
                <Link href="/reviews" className="text-sm underline transition hover:opacity-70">
                  Read all reviews
                </Link>
              </FadeIn>
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
