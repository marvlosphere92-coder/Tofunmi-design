import Link from "next/link";
import { SiteNav, SiteFooter } from "@/components/SiteNav";

export default function WaitlistThanksPage() {
  return (
    <>
      <SiteNav />
      <main className="flex-1 mx-auto max-w-md px-6 py-20 text-center">
        <h1 className="font-serif text-2xl">You&apos;re on the list</h1>
        <p className="mt-3 text-foreground/70">
          She&apos;ll reach out on WhatsApp once a slot opens up.
        </p>
        <Link href="/" className="mt-6 inline-block text-sm underline">
          Back to home
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
