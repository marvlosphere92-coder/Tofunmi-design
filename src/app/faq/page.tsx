import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { FadeIn } from "@/components/FadeIn";

export const metadata = {
  title: "FAQ | SimplyBukky",
};

export default function FaqPage() {
  return (
    <>
      <SiteNav />
      <main className="flex-1">
        <FadeIn>
          <section className="mx-auto max-w-2xl px-6 py-16">
            <h1 className="font-serif text-3xl mb-10">FAQ</h1>
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
