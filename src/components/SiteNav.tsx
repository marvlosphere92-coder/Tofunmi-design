import Link from "next/link";

export function SiteNav() {
  return (
    <header className="border-b border-accent-soft">
      <nav className="mx-auto max-w-5xl flex items-center justify-between px-6 py-5">
        <Link href="/" className="font-serif text-2xl tracking-wide">
          Her Brand
        </Link>
        <div className="flex gap-6 text-sm">
          <Link href="/designs">Lookbook</Link>
          <Link href="/#about">About</Link>
          <Link href="/#faq">FAQ</Link>
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
