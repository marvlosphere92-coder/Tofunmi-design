import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { joinWaitlist } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";
import { PhoneInput } from "@/components/PhoneInput";

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
          <label className="block text-sm font-medium" htmlFor="fullName">
            Full name
            <input
              id="fullName"
              name="fullName"
              required
              autoComplete="name"
              className="block w-full rounded-md border border-accent-soft px-3 py-2 text-base mt-1 font-normal"
            />
          </label>
          <label className="block text-sm font-medium" htmlFor="phone">
            Phone (WhatsApp number)
            <PhoneInput
              id="phone"
              name="phone"
              required
              className="block w-full rounded-md border border-accent-soft px-3 py-2 text-base mt-1 font-normal"
            />
          </label>
          <label className="block text-sm font-medium" htmlFor="notes">
            What style are you interested in?
            <textarea
              id="notes"
              name="notes"
              className="block w-full rounded-md border border-accent-soft px-3 py-2 text-base mt-1 font-normal"
              rows={3}
            />
          </label>
          <SubmitButton
            className="w-full rounded-full bg-accent text-white py-3 shadow-sm hover:shadow-lg"
            pendingText="Joining…"
          >
            Join waitlist
          </SubmitButton>
        </form>
      </main>
      <SiteFooter />
    </>
  );
}
