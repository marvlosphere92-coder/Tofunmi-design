import Link from "next/link";
import { SiteNav, SiteFooter } from "@/components/SiteNav";

export default function NotFound() {
  return (
    <>
      <SiteNav />
      <main className="flex-1 flex items-center justify-center px-6 py-20 text-center">
        <div>
          <h1 className="font-serif text-2xl">Page not found</h1>
          <p className="mt-3 text-foreground/70">
            That page doesn&apos;t exist, or may have moved.
          </p>
          <Link
            href="/"
            className="mt-8 inline-block rounded-full bg-accent text-white px-6 py-3 transition hover:opacity-90 active:scale-95"
          >
            Back to home
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
