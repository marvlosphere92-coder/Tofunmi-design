"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/designs", label: "Designs" },
  { href: "/admin/materials", label: "Materials" },
  { href: "/admin/clients", label: "Clients" },
  { href: "/admin/waitlist", label: "Waitlist" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/account", label: "Account" },
];

export function AdminNavLinks() {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm flex-1">
      {links.map((l) => {
        const active = l.href === "/admin" ? pathname === "/admin" : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`transition hover:opacity-70 ${active ? "font-medium underline" : ""}`}
          >
            {l.label}
          </Link>
        );
      })}
    </div>
  );
}
