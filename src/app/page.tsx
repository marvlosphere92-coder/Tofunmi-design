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
      .limit(6),
    supabase.from("capacity_settings").select("*").single(),
  ]);

  const featured = (designs ?? []) as Design[];
  const cap = capacity as CapacitySettings | null;

  return (
    <>
      <SiteNav />
      <main className="flex-1">
        <section className="mx-auto max-w-5xl px-6 py-20 text-center">
          <h1 className="font-serif text-5xl leading-tight">
            Bespoke fashion,
            <br /> made just for you
          </h1>
          <p className="mt-4 text-foreground/70 max-w-xl mx-auto">
            Every piece is cut, sewn, and finished by hand. Browse the
            lookbook, then send your order straight to WhatsApp.
          </p>

          {cap && !cap.accepting_orders ? (
            <div className="mt-6 inline-block rounded-full bg-accent-soft px-5 py-2 text-sm">
              Currently fully booked
              {cap.booked_until
                ? ` until ${new Date(cap.booked_until).toLocaleDateString()}`
                : ""}
              . <Link href="/waitlist" className="underline">Join the waitlist</Link>
            </div>
          ) : (
            <Link
              href="/designs"
              className="mt-6 inline-block rounded-full bg-accent px-8 py-3 text-white"
            >
              View the Lookbook
            </Link>
          )}
        </section>

        {featured.length > 0 && (
          <section className="mx-auto max-w-5xl px-6 pb-20">
            <h2 className="font-serif text-2xl mb-6">Recent pieces</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {featured.map((d) => (
                <Link
                  key={d.id}
                  href={`/designs/${d.id}`}
                  className="group block"
                >
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
          </section>
        )}

        <section id="about" className="mx-auto max-w-3xl px-6 py-16 text-center">
          <h2 className="font-serif text-2xl mb-4">About the designer</h2>
          <p className="text-foreground/70">
            Every order is sewn personally, start to finish — no factory, no
            shortcuts. That&apos;s why capacity is limited and pieces are made
            to measure.
          </p>
        </section>

        <section id="faq" className="mx-auto max-w-3xl px-6 py-16">
          <h2 className="font-serif text-2xl mb-6 text-center">FAQ</h2>
          <div className="space-y-6 text-sm">
            <div>
              <p className="font-medium">How does payment work?</p>
              <p className="text-foreground/70">
                A deposit secures your order once details are confirmed on
                WhatsApp; balance is due at fitting or pickup.
              </p>
            </div>
            <div>
              <p className="font-medium">Can I bring my own fabric?</p>
              <p className="text-foreground/70">
                Yes — select &quot;I&apos;ll bring my own fabric&quot; on the
                order form and only the labour price applies.
              </p>
            </div>
            <div>
              <p className="font-medium">How long does an order take?</p>
              <p className="text-foreground/70">
                Typical turnaround is 2–3 weeks depending on the piece and
                current bookings.
              </p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
