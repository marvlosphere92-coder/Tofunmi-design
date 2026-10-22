import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const navLinkClass =
  "relative after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 after:bg-foreground after:transition-all after:duration-300 hover:after:w-full";

export async function SiteNav() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const isCustomer = data.user && data.user.app_metadata?.role !== "admin";

  return (
    <header className="border-b border-accent-soft">
      <nav className="mx-auto max-w-6xl flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 sm:px-6 py-4 sm:py-5">
        <Link href="/" className="font-serif text-lg sm:text-2xl tracking-wide leading-tight">
          SimplyBukky
        </Link>
        <div className="flex gap-4 sm:gap-6 text-sm">
          <Link href="/designs" className={navLinkClass}>Lookbook</Link>
          <Link href="/reviews" className={navLinkClass}>Reviews</Link>
          <Link href="/about" className={navLinkClass}>About</Link>
          <Link href="/about#faq" className={navLinkClass}>FAQ</Link>
          <Link href="/account" className={navLinkClass}>
            {isCustomer ? "My orders" : "Sign in"}
          </Link>
        </div>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const phone = whatsappNumber ? `+${whatsappNumber}` : null;

  return (
    <footer className="border-t border-accent-soft mt-16 bg-accent-soft/20">
      <div className="mx-auto max-w-6xl px-6 py-12 grid gap-10 sm:grid-cols-3 text-sm">
        <div>
          <p className="font-serif text-xl tracking-wide">SimplyBukky</p>
          <p className="mt-2 text-foreground/60">
            Bespoke fashion, made by hand — one piece at a time.
          </p>
        </div>
        <div>
          <p className="font-medium text-foreground/80 mb-3">Explore</p>
          <ul className="space-y-2 text-foreground/60">
            <li>
              <Link href="/designs" className="transition hover:opacity-70">
                Lookbook
              </Link>
            </li>
            <li>
              <Link href="/reviews" className="transition hover:opacity-70">
                Reviews
              </Link>
            </li>
            <li>
              <Link href="/about" className="transition hover:opacity-70">
                About
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="transition hover:opacity-70">
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-medium text-foreground/80 mb-3">Get in touch</p>
          <ul className="space-y-2 text-foreground/60">
            {email && (
              <li>
                <a href={`mailto:${email}`} className="transition hover:opacity-70">
                  {email}
                </a>
              </li>
            )}
            {phone && (
              <li>
                <a href={`tel:${phone}`} className="transition hover:opacity-70">
                  {phone}
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t border-accent-soft py-4 text-center text-xs text-foreground/50">
        &copy; {new Date().getFullYear()} SimplyBukky. All rights reserved.
      </div>
    </footer>
  );
}
