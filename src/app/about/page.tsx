import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { FadeIn } from "@/components/FadeIn";

export default function AboutPage() {
  return (
    <>
      <SiteNav />
      <main className="flex-1">
        <div className="relative h-[50vh] min-h-[320px] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1606501126768-b78d4569d3f9?auto=format&fit=crop&w=1800&q=80"
            alt="Hands guiding fabric through a sewing machine"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-foreground/30 flex items-end">
            <h1 className="font-serif text-4xl text-white px-6 pb-10 mx-auto max-w-3xl w-full">
              About the designer
            </h1>
          </div>
        </div>

        <FadeIn>
          <section className="mx-auto max-w-2xl px-6 py-16 space-y-4">
            <p className="text-foreground/80 text-lg leading-relaxed">
              Every order is sewn personally, start to finish — no factory, no
              shortcuts. Fabric is cut by hand, fitted to your exact
              measurements, and finished with the kind of detail that only
              comes from one person seeing a piece through from sketch to
              final stitch.
            </p>
            <p className="text-foreground/70 leading-relaxed">
              That&apos;s also why capacity is limited: a handful of pieces at
              a time, made properly, rather than many made in a rush.
            </p>
          </section>
        </FadeIn>

        <FadeIn>
          <section className="mx-auto max-w-2xl px-6 pb-16">
            <h2 className="font-serif text-2xl mb-6">See her at work</h2>
            <video
              src="https://res.cloudinary.com/jikyx7x6/video/upload/tailor-site/designs/portfolio-video.mp4"
              controls
              playsInline
              className="w-full rounded-lg bg-black"
            />
          </section>
        </FadeIn>

        <FadeIn>
          <section id="faq" className="mx-auto max-w-2xl px-6 pb-20">
            <h2 className="font-serif text-2xl mb-6">FAQ</h2>
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
        </FadeIn>
      </main>
      <SiteFooter />
    </>
  );
}
