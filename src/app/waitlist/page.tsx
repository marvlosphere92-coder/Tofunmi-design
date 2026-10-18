import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { joinWaitlist } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";

export default async function WaitlistPage({
  searchParams,
}: {
  searchParams: Promise<{ design?: string }>;
}) {
  const { design } = await searchParams;

  return (
    <>
      <SiteNav />
      <main className="flex-1 mx-auto max-w-md px-6 py-16 w-full">
        <h1 className="font-serif text-2xl">Join the waitlist</h1>
        <p className="mt-2 text-sm text-foreground/70">
          We&apos;re fully booked right now. Leave your details and we&apos;ll
          reach out as soon as a slot opens.
        </p>

        <form action={joinWaitlist} className="mt-6 space-y-3">
          {design && <input type="hidden" name="designReference" value={design} />}
          <input
            name="fullName"
            required
            placeholder="Full name"
            className="w-full rounded-md border border-accent-soft px-3 py-2"
          />
          <input
            name="phone"
            required
            placeholder="Phone (WhatsApp number)"
            className="w-full rounded-md border border-accent-soft px-3 py-2"
          />
          <textarea
            name="notes"
            placeholder="What style are you interested in?"
            className="w-full rounded-md border border-accent-soft px-3 py-2"
            rows={3}
          />
          <SubmitButton className="w-full rounded-full bg-accent text-white py-3" pendingText="Joining…">
            Join waitlist
          </SubmitButton>
        </form>
      </main>
      <SiteFooter />
    </>
  );
}
