import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { whatsappOrderLink } from "@/lib/whatsapp";
import { FadeIn } from "@/components/FadeIn";
import { ReviewsGrid } from "@/components/ReviewsGrid";
import { SaveDesignButton } from "@/components/SaveDesignButton";
import type { Design, Review } from "@/types/db";

export default async function DesignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data }, { data: reviewsData }, { data: userData }] = await Promise.all([
    supabase.from("designs").select("*").eq("id", id).single(),
    supabase
      .from("reviews")
      .select("*")
      .eq("design_id", id)
      .eq("published", true)
      .order("created_at", { ascending: false }),
    supabase.auth.getUser(),
  ]);

  if (!data) notFound();
  const design = data as Design;
  const photos = design.photos?.length ? design.photos : [design.cover_photo_url].filter(Boolean);
  const videos = design.videos ?? [];
  const reviews = (reviewsData ?? []) as Review[];

  const signedIn = Boolean(userData.user) && userData.user?.app_metadata?.role !== "admin";
  let initialSaved = false;
  if (signedIn) {
    // RLS already scopes saved_designs to rows owned by this signed-in
    // customer, so a plain filter by design_id is enough here.
    const { data: savedRow } = await supabase
      .from("saved_designs")
      .select("id")
      .eq("design_id", id)
      .maybeSingle();
    initialSaved = Boolean(savedRow);
  }

  return (
    <>
      <SiteNav />
      <main className="flex-1 mx-auto max-w-5xl px-6 py-12 w-full grid md:grid-cols-2 gap-10">
        <div className="space-y-3">
          {photos.map((url, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url as string}
                alt={`${design.title} photo ${i + 1}`}
                className="w-full rounded-lg object-cover"
              />
            </FadeIn>
          ))}
          {videos.map((url, i) => (
            <FadeIn key={`v-${i}`} delay={(photos.length + i) * 0.1}>
              <video
                src={url}
                controls
                playsInline
                className="w-full rounded-lg bg-black"
              />
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.15}>
          <p className="text-xs uppercase tracking-wide text-accent">{design.category}</p>
          <h1 className="font-serif text-3xl mt-1">{design.title}</h1>
          <p className="mt-4 text-foreground/70">{design.description}</p>

          {design.labour_price != null || design.estimated_yards ? (
            <p className="mt-6 text-lg">
              {design.labour_price != null && (
                <>
                  From <span className="font-medium">₦{design.labour_price.toLocaleString()}</span>{" "}
                  labour
                </>
              )}
              {design.labour_price != null && design.estimated_yards ? " · " : ""}
              {design.estimated_yards ? `~${design.estimated_yards} yards` : ""}
            </p>
          ) : (
            <p className="mt-6 text-lg text-foreground/60">
              Price on request — message us on WhatsApp for a quote.
            </p>
          )}

          <div className="mt-8 flex flex-col gap-3">
            <Link
              href={`/order/${design.id}`}
              className="rounded-full bg-accent text-white text-center px-6 py-3 shadow-sm transition hover:opacity-90 hover:shadow-lg hover:-translate-y-0.5 active:scale-95"
            >
              Request this order
            </Link>
            <a
              href={whatsappOrderLink(design.title, design.reference)}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-accent-soft text-center px-6 py-3 transition hover:bg-accent-soft hover:-translate-y-0.5 active:scale-95"
            >
              Ask a quick question on WhatsApp
            </a>
            <div className="flex justify-center">
              <SaveDesignButton designId={design.id} initialSaved={initialSaved} signedIn={signedIn} />
            </div>
          </div>
        </FadeIn>
      </main>

      {reviews.length > 0 && (
        <section className="mx-auto max-w-5xl px-6 pb-16">
          <h2 className="font-serif text-xl mb-4">Reviews for this design</h2>
          <ReviewsGrid reviews={reviews} />
        </section>
      )}

      <SiteFooter />
    </>
  );
}
