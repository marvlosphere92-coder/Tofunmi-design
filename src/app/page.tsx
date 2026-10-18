import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { HeroReveal } from "@/components/HeroReveal";
import { DesignCard } from "@/components/DesignCard";
import { FadeIn } from "@/components/FadeIn";
import type { CapacitySettings, Design } from "@/types/db";

export default async function Home() {
  const supabase = await createClient();

  const [{ data: designs }, { data: capacity }] = await Promise.all([
    supabase
      .from("designs")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false })
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
            src="https://images.unsplash.com/photo-1618998584360-10a0c28eec0f?auto=format&fit=crop&w=2000&q=80"
            alt="A bride in a traditional coral-bead headdress and beaded jewelry"
            className="h-full w-full object-cover object-top"
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
                  . <Link href="/waitlist" className="underline">Join the waitlist</Link>
                </p>
              )
            }
          />
        </div>

        {featured.length > 0 && (
          <section className="mx-auto max-w-6xl px-6 py-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featured.map((d, i) => (
                <DesignCard key={d.id} design={d} index={i} />
              ))}
            </div>
            <FadeIn className="text-center mt-10">
              <Link href="/designs" className="text-sm underline">
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
