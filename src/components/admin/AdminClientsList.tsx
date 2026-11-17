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
  const [sort, setSort] = useState<"newest" | "name" | "most-orders">("newest");
  const [onlyWithOrders, setOnlyWithOrders] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let result = clients.filter(
      (c) =>
        !q ||
        c.full_name.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q)
    );
    if (onlyWithOrders) {
      result = result.filter((c) => (orderCounts[c.id] ?? 0) > 0);
    }
    result = [...result];
    if (sort === "name") {
      result.sort((a, b) => a.full_name.localeCompare(b.full_name));
    } else if (sort === "most-orders") {
      result.sort((a, b) => (orderCounts[b.id] ?? 0) - (orderCounts[a.id] ?? 0));
    }
    // "newest" keeps the incoming order (already sorted by signup date).
    return result;
  }, [clients, search, sort, onlyWithOrders, orderCounts]);

  return (
    <div>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name, phone, or email…"
        className="w-full rounded-md border border-accent-soft px-3 py-2 mb-3"
      />
      <div className="flex flex-wrap items-center gap-3 mb-4 text-sm">
        <label className="text-foreground/70">
          Sort by{" "}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="rounded-md border border-accent-soft px-2 py-1 ml-1"
          >
            <option value="newest">Newest first</option>
            <option value="name">Name (A–Z)</option>
            <option value="most-orders">Most orders</option>
          </select>
        </label>
        <label className="flex items-center gap-1.5 text-foreground/70">
          <input
            type="checkbox"
            checked={onlyWithOrders}
            onChange={(e) => setOnlyWithOrders(e.target.checked)}
          />
          Only clients with orders
        </label>
      </div>
      <div className="space-y-2">
        {filtered.map((c) => (
          <Link
            key={c.id}
            href={`/admin/clients/${c.id}`}
            className="rounded-lg border border-accent-soft p-4 flex items-center justify-between gap-3 transition hover:bg-accent-soft/40"
          >
            <div>
              <p className="font-medium">{c.full_name}</p>
              <p className="text-sm text-foreground/70">
                {c.phone}
                {c.email ? ` · ${c.email}` : ""}
              </p>
            </div>
            <p className="text-sm text-foreground/70">
              {orderCounts[c.id] ?? 0} order{orderCounts[c.id] === 1 ? "" : "s"}
            </p>
          </Link>
        ))}
        {filtered.length === 0 && (
          <p className="text-foreground/70">
            {clients.length === 0 ? "No clients yet." : "No clients match your search or filter."}
          </p>
        )}
      </div>
    </div>
  );
}
