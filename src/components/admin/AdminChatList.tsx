"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Client, ChatMessage } from "@/types/db";

export function AdminChatList({
  threads,
}: {
  threads: { client: Client; lastMessage: ChatMessage | null; unread: number }[];
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return threads;
    return threads.filter(
      ({ client }) =>
        client.full_name.toLowerCase().includes(q) || client.phone?.toLowerCase().includes(q)
    );
  }, [threads, search]);

  return (
    <div>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name or phone…"
        className="w-full rounded-md border border-accent-soft px-3 py-2 mb-4"
      />
      <div className="space-y-2">
        {filtered.map(({ client, lastMessage, unread }) => (
          <Link
            key={client.id}
            href={`/admin/chat/${client.id}`}
            className="flex items-center justify-between gap-3 rounded-lg border border-accent-soft p-4 transition hover:bg-accent-soft/20"
          >
            <div className="min-w-0">
              <p className="font-medium">{client.full_name}</p>
              <p className="text-sm text-foreground/70 truncate">
                {lastMessage
                  ? `${lastMessage.sender_role === "admin" ? "You: " : ""}${lastMessage.body}`
                  : "No messages yet"}
              </p>
            </div>
            <div className="flex-shrink-0 flex flex-col items-end gap-1">
              {lastMessage && (
                <span className="text-xs text-foreground/60">
                  {new Date(lastMessage.created_at).toLocaleDateString()}
                </span>
              )}
              {unread > 0 && (
                <span className="rounded-full bg-accent text-white text-xs px-2 py-0.5">{unread}</span>
              )}
            </div>
          </Link>
        ))}
        {filtered.length === 0 && <p className="text-foreground/70">No customers match your search.</p>}
      </div>
    </div>
  );
}
