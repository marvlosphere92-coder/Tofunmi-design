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
          Tofunmi&apos;s Fashion Home
        </Link>
        <div className="flex gap-4 sm:gap-6 text-sm">
          <Link href="/designs" className={navLinkClass}>Lookbook</Link>
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
    <footer className="border-t border-accent-soft mt-16 py-8 text-center text-sm text-foreground/70">
      <p>&copy; {new Date().getFullYear()} Tofunmi&apos;s Fashion Home. Made by hand, one piece at a time.</p>
      {(email || phone) && (
        <p className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          {email && (
            <a href={`mailto:${email}`} className="transition hover:opacity-70">
              {email}
            </a>
          )}
          {phone && (
            <a href={`tel:${phone}`} className="transition hover:opacity-70">
              {phone}
            </a>
          )}
        </p>
      )}
    </footer>
  );
}
