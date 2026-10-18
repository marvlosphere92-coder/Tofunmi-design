import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { HeroReveal } from "@/components/HeroReveal";
import { DesignCard } from "@/components/DesignCard";
import { FadeIn } from "@/components/FadeIn";
import { CategoryTiles } from "@/components/CategoryTiles";
import { StatsStrip } from "@/components/StatsStrip";
import { EditorialBreak } from "@/components/EditorialBreak";
import type { CapacitySettings, Design } from "@/types/db";

export default async function Home() {
  const supabase = await createClient();

  const [{ data: designs }, { data: capacity }] = await Promise.all([
    supabase
      .from("designs")
      .select("*")
      .eq("active", true)
      .order("display_order", { ascending: true })
      .limit(8),
    supabase.from("capacity_settings").select("*").single(),
  ]);

  const featured = (designs ?? []) as Design[];
  const cap = capacity as CapacitySettings | null;

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
        <CategoryTiles />
        <EditorialBreak />

        {featured.length > 0 && (
          <section className="mx-auto max-w-6xl px-6 py-16">
            <h2 className="font-serif text-2xl mb-8 text-center">From the lookbook</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featured.map((d, i) => (
                <DesignCard key={d.id} design={d} index={i} />
              ))}
            </div>
            <FadeIn className="text-center mt-10">
              <Link href="/designs" className="text-sm underline transition hover:opacity-70">
                See the full lookbook
              </Link>
            </FadeIn>
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
