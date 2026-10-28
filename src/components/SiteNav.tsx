import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { whatsappGeneralLink, formatPhoneDisplay } from "@/lib/whatsapp";
import { Avatar } from "@/components/Avatar";
import { SubmitButton } from "@/components/SubmitButton";
import { signOutCustomer } from "@/app/account/actions";

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

function MessageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 4h16v12H7l-3 3V4Z"
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
  const [{ data }, { count: reviewCount }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("reviews").select("id", { count: "exact", head: true }).eq("published", true),
  ]);
  const isCustomer = data.user && data.user.app_metadata?.role !== "admin";
  const hasReviews = Boolean(reviewCount);
  const displayName =
    (data.user?.user_metadata?.full_name as string | undefined) ||
    (data.user?.user_metadata?.name as string | undefined) ||
    data.user?.email;

  let savedCount = 0;
  let chatUnreadCount = 0;
  if (isCustomer && data.user) {
    const { data: client } = await supabase
      .from("clients")
      .select("id")
      .eq("user_id", data.user.id)
      .maybeSingle();
    if (client) {
      const [{ count: saved }, { count: unread }] = await Promise.all([
        supabase
          .from("saved_designs")
          .select("id", { count: "exact", head: true })
          .eq("client_id", client.id),
        supabase
          .from("chat_messages")
          .select("id", { count: "exact", head: true })
          .eq("client_id", client.id)
          .eq("sender_role", "admin")
          .eq("read_by_client", false),
      ]);
      savedCount = saved ?? 0;
      chatUnreadCount = unread ?? 0;
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-accent-soft bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <nav className="mx-auto max-w-6xl flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 sm:px-6 py-4 sm:py-5">
        <Link href="/" className="font-serif text-lg sm:text-2xl tracking-wide leading-tight">
          SimplyBukky
        </Link>
        <div className="flex items-center gap-1 sm:gap-4 text-sm">
          <Link href="/designs" className={`${navLinkClass} flex items-center min-h-11 px-2`}>
            Lookbook
          </Link>
          {hasReviews && (
            <Link href="/reviews" className={`${navLinkClass} flex items-center min-h-11 px-2`}>
              Reviews
            </Link>
          )}
          {isCustomer && savedCount > 0 && (
            <Link href="/account#saved" className={`${navLinkClass} flex items-center min-h-11 px-2`}>
              Saved ({savedCount})
            </Link>
          )}
          {isCustomer && (
            <Link href="/account/chat" className={`${navLinkClass} flex items-center gap-1.5 min-h-11 px-2`}>
              Messages
              {chatUnreadCount > 0 && (
                <span className="rounded-full bg-accent text-white text-[10px] px-1.5 py-0.5 leading-none">
                  {chatUnreadCount}
                </span>
              )}
            </Link>
          )}
          <Link href="/account" className={`${navLinkClass} flex items-center gap-2 min-h-11 px-2`}>
            {isCustomer && displayName && <Avatar name={displayName} className="w-6 h-6 text-xs" />}
            {isCustomer ? "My orders" : "Sign in"}
          </Link>
          {isCustomer && (
            <form action={signOutCustomer}>
              <SubmitButton
                className="flex items-center min-h-11 px-2 text-foreground/70 hover:text-accent transition"
                pendingText="Signing out…"
              >
                Sign out
              </SubmitButton>
            </form>
          )}
        </div>
      </nav>
    </header>
  );
}

export async function SiteFooter() {
  const supabase = await createClient();
  const [{ count: reviewCount }, { data: userData }] = await Promise.all([
    supabase.from("reviews").select("id", { count: "exact", head: true }).eq("published", true),
    supabase.auth.getUser(),
  ]);
  const hasReviews = Boolean(reviewCount);
  const isCustomer = userData.user && userData.user.app_metadata?.role !== "admin";
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const phone = whatsappNumber ? `+${whatsappNumber}` : null;

  return (
    <footer className="border-t border-accent-soft mt-16 bg-accent-soft/20">
      <div className="mx-auto max-w-6xl px-6 py-12 grid gap-10 sm:grid-cols-3 text-sm">
        <div>
          <p className="font-serif text-xl tracking-wide">SimplyBukky</p>
          <p className="mt-2 text-foreground/70">
            Custom fashion, made by hand — one piece at a time.
          </p>
        </div>
        <div>
          <p className="font-medium text-foreground/80 mb-3">Explore</p>
          <ul className="space-y-2 text-foreground/70">
            <li>
              <Link href="/designs" className="transition hover:opacity-70">
                Lookbook
              </Link>
            </li>
            {hasReviews && (
              <li>
                <Link href="/reviews" className="transition hover:opacity-70">
                  Reviews
                </Link>
              </li>
            )}
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
            <a
              href={isCustomer ? "/account/chat" : "/account"}
              className="flex items-center gap-3 rounded-lg px-3 py-2 -mx-3 transition hover:bg-surface hover:shadow-sm"
            >
              <span className="flex items-center justify-center w-9 h-9 rounded-full bg-accent-soft text-accent flex-shrink-0">
                <MessageIcon />
              </span>
              <span>
                <span className="block text-xs uppercase tracking-wide text-foreground/70">
                  Chat on the app
                </span>
                <span className="text-foreground/80">
                  {isCustomer ? "Message us anytime" : "Sign in to message us"}
                </span>
              </span>
            </a>
            {phone && (
              <a
                href={`tel:${phone}`}
                className="flex items-center gap-3 rounded-lg px-3 py-2 -mx-3 transition hover:bg-surface hover:shadow-sm"
              >
                <span className="flex items-center justify-center w-9 h-9 rounded-full bg-accent-soft text-accent flex-shrink-0">
                  <PhoneIcon />
                </span>
                <span>
                  <span className="block text-xs uppercase tracking-wide text-foreground/70">
                    Call us
                  </span>
                  <span className="text-foreground/80">{formatPhoneDisplay(phone)}</span>
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
                  <span className="block text-xs uppercase tracking-wide text-foreground/70">
                    WhatsApp
                  </span>
                  <span className="text-foreground/80">{formatPhoneDisplay(phone)}</span>
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
                  <span className="block text-xs uppercase tracking-wide text-foreground/70">
                    Email
                  </span>
                  <span className="text-foreground/80 break-words">{email}</span>
                </span>
              </a>
            )}
          </div>
        </div>
      </div>
      <div className="border-t border-accent-soft py-4 text-center text-xs text-foreground/70">
        &copy; {new Date().getFullYear()} SimplyBukky. All rights reserved.
      </div>
    </footer>
  );
}
