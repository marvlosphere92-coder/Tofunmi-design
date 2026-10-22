"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Shows up in Vercel's runtime logs, which is the only error
    // visibility this project has until a real monitoring tool is added.
    console.error("Unhandled page error:", error);
  }, [error]);

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-20 text-center">
      <div>
        <h1 className="font-serif text-2xl">Something went wrong</h1>
        <p className="mt-3 text-foreground/70">
          Sorry about that — please try again, or message us on WhatsApp if it keeps happening.
        </p>
        <div className="mt-8 flex flex-col gap-3 max-w-xs mx-auto">
          <button
            onClick={() => reset()}
            className="rounded-full bg-accent text-white px-6 py-3 transition hover:opacity-90 active:scale-95"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-full border border-accent-soft text-center px-6 py-3 transition hover:bg-accent-soft active:scale-95"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
