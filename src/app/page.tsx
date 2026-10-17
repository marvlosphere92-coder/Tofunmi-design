import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
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
            src="https://images.unsplash.com/photo-1492175742197-ed20dc5a6bed?auto=format&fit=crop&w=2000&q=80"
            alt="A bride in a flowing gown, lit by soft window light"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/20" />
          <div className="absolute inset-0 flex flex-col items-center justify-end text-center px-6 pb-16">
            <h1 className="font-serif text-5xl md:text-6xl text-white leading-tight">
              Bespoke fashion,
              <br /> made just for you
            </h1>
            <Link
              href="/designs"
              className="mt-8 inline-block rounded-full bg-white/95 text-foreground px-8 py-3 hover:bg-white transition"
            >
              View the Lookbook
            </Link>
            {cap && !cap.accepting_orders && (
              <p className="mt-4 text-sm text-white/90">
                Currently fully booked
                {cap.booked_until
                  ? ` until ${new Date(cap.booked_until).toLocaleDateString()}`
                  : ""}
                . <Link href="/waitlist" className="underline">Join the waitlist</Link>
              </p>
            )}
          </div>
        </div>

        {featured.length > 0 && (
          <section className="mx-auto max-w-6xl px-6 py-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featured.map((d) => (
                <Link key={d.id} href={`/designs/${d.id}`} className="group block">
                  <div className="aspect-[3/4] overflow-hidden rounded-lg bg-accent-soft">
                    {d.cover_photo_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={d.cover_photo_url}
                        alt={d.title}
                        className="h-full w-full object-cover transition group-hover:scale-105"
                      />
                    )}
                  </div>
                  <p className="mt-2 text-sm">{d.title}</p>
                  <p className="text-xs text-foreground/60">
                    From ₦{d.labour_price.toLocaleString()}
                  </p>
                </Link>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link href="/designs" className="text-sm underline">
                See the full lookbook
              </Link>
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
