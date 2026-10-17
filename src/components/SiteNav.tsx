import Link from "next/link";

const navLinkClass =
  "relative after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 after:bg-foreground after:transition-all after:duration-300 hover:after:w-full";

export function SiteNav() {
  return (
    <header className="border-b border-accent-soft">
      <nav className="mx-auto max-w-6xl flex items-center justify-between px-6 py-5">
        <Link href="/" className="font-serif text-2xl tracking-wide">
          Her Brand
        </Link>
        <div className="flex gap-6 text-sm">
          <Link href="/designs" className={navLinkClass}>Lookbook</Link>
          <Link href="/about" className={navLinkClass}>About</Link>
          <Link href="/about#faq" className={navLinkClass}>FAQ</Link>
        </div>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-accent-soft mt-16 py-8 text-center text-sm text-foreground/70">
      <p>&copy; {new Date().getFullYear()} Her Brand. Made by hand, one piece at a time.</p>
    </footer>
  );
}
