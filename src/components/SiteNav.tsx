import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { whatsappGeneralLink } from "@/lib/whatsapp";

const navLinkClass =
  "relative after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 after:bg-accent after:transition-all after:duration-300 hover:text-accent hover:after:w-full";

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 5a2 2 0 0 1 2-2h2.28a1 1 0 0 1 .97.76l1 4a1 1 0 0 1-.46 1.11L7.1 9.72a12.05 12.05 0 0 0 5.18 5.18l.85-1.69a1 1 0 0 1 1.11-.46l4 1a1 1 0 0 1 .76.97V19a2 2 0 0 1-2 2h-1C9.72 21 3 14.28 3 6V5Z"
      />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 4h16v16H4V4Zm0 2 8 7 8-7"
      />
    </svg>
  );
}

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
          <div className="space-y-2">
            {phone && (
              <a
                href={`tel:${phone}`}
                className="flex items-center gap-3 rounded-lg px-3 py-2 -mx-3 transition hover:bg-surface hover:shadow-sm"
              >
                <span className="flex items-center justify-center w-9 h-9 rounded-full bg-accent-soft text-accent flex-shrink-0">
                  <PhoneIcon />
                </span>
                <span>
                  <span className="block text-xs uppercase tracking-wide text-foreground/50">
                    Call us
                  </span>
                  <span className="text-foreground/80">{phone}</span>
                </span>
              </a>
            )}
            {phone && (
              <a
                href={whatsappGeneralLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg px-3 py-2 -mx-3 transition hover:bg-surface hover:shadow-sm"
              >
                <span className="flex items-center justify-center w-9 h-9 rounded-full bg-accent-soft text-accent flex-shrink-0">
                  <ChatIcon />
                </span>
                <span>
                  <span className="block text-xs uppercase tracking-wide text-foreground/50">
                    WhatsApp
                  </span>
                  <span className="text-foreground/80">{phone}</span>
                </span>
              </a>
            )}
            {email && (
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-3 rounded-lg px-3 py-2 -mx-3 transition hover:bg-surface hover:shadow-sm"
              >
                <span className="flex items-center justify-center w-9 h-9 rounded-full bg-accent-soft text-accent flex-shrink-0">
                  <MailIcon />
                </span>
                <span>
                  <span className="block text-xs uppercase tracking-wide text-foreground/50">
                    Email
                  </span>
                  <span className="text-foreground/80 break-all">{email}</span>
                </span>
              </a>
            )}
          </div>
        </div>
      </div>
      <div className="border-t border-accent-soft py-4 text-center text-xs text-foreground/50">
        &copy; {new Date().getFullYear()} SimplyBukky. All rights reserved.
      </div>
    </footer>
  );
}
