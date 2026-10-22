"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Client } from "@/types/db";

export function AdminClientsList({
  clients,
  orderCounts,
}: {
  clients: Client[];
  orderCounts: Record<string, number>;
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter(
      (c) =>
        c.full_name.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q)
    );
  }, [clients, search]);

  return (
    <div>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name, phone, or email…"
        className="w-full rounded-md border border-accent-soft px-3 py-2 mb-4"
      />
      <div className="space-y-2">
        {filtered.map((c) => (
          <Link
            key={c.id}
            href={`/admin/clients/${c.id}`}
            className="rounded-lg border border-accent-soft p-4 flex items-center justify-between gap-3 transition hover:bg-accent-soft/40"
          >
            <div>
              <p className="font-medium">{c.full_name}</p>
              <p className="text-sm text-foreground/60">
                {c.phone}
                {c.email ? ` · ${c.email}` : ""}
              </p>
            </div>
            <p className="text-sm text-foreground/60">
              {orderCounts[c.id] ?? 0} order{orderCounts[c.id] === 1 ? "" : "s"}
            </p>
          </Link>
        ))}
        {filtered.length === 0 && (
          <p className="text-foreground/60">
            {clients.length === 0 ? "No clients yet." : "No clients match your search."}
          </p>
        )}
      </div>
    </div>
  );
}
