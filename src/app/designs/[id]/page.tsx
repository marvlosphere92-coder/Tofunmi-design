import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { whatsappOrderLink } from "@/lib/whatsapp";
import { FadeIn } from "@/components/FadeIn";
import type { Design } from "@/types/db";

export default async function DesignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("designs").select("*").eq("id", id).single();

  if (!data) notFound();
  const design = data as Design;
  const photos = design.photos?.length ? design.photos : [design.cover_photo_url].filter(Boolean);
  const videos = design.videos ?? [];

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

          {(design.labour_price != null || design.estimated_yards) && (
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
          )}

          <div className="mt-8 flex flex-col gap-3">
            <Link
              href={`/order/${design.id}`}
              className="rounded-full bg-accent text-white text-center px-6 py-3 transition hover:opacity-90 active:scale-95"
            >
              Request this order
            </Link>
            <a
              href={whatsappOrderLink(design.title, design.reference)}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-accent-soft text-center px-6 py-3 transition hover:bg-accent-soft active:scale-95"
            >
              Ask a quick question on WhatsApp
            </a>
          </div>
        </FadeIn>
      </main>
      <SiteFooter />
    </>
  );
}
