"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/designs", label: "Designs" },
  { href: "/admin/materials", label: "Materials" },
  { href: "/admin/clients", label: "Clients" },
  { href: "/admin/chat", label: "Messages" },
  { href: "/admin/waitlist", label: "Waitlist" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/account", label: "Account" },
];

export function AdminNavLinks({ chatUnreadCount = 0 }: { chatUnreadCount?: number }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm flex-1">
      {links.map((l) => {
        const active = l.href === "/admin" ? pathname === "/admin" : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`transition hover:text-gold-rich inline-flex items-center gap-1.5 ${
              active ? "font-medium text-gold-rich underline underline-offset-4" : "text-white/80"
            }`}
          >
            {l.label}
            {l.href === "/admin/chat" && chatUnreadCount > 0 && (
              <span className="rounded-full bg-gold text-plum text-[10px] font-medium px-1.5 py-0.5 leading-none">
                {chatUnreadCount}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
