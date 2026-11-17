"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Client, ChatMessage } from "@/types/db";

export function AdminChatList({
  threads,
}: {
  threads: { client: Client; lastMessage: ChatMessage | null; unread: number }[];
}) {
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    // This list (unlike an open conversation) had no live-update at all —
    // it only ever reflected whatever was true when the page last loaded.
    // Realtime refreshes it the moment any message changes; the interval
    // is a safety net in case that connection silently drops, which
    // WebSockets are prone to on flaky or backgrounded mobile connections.
    const channel = supabase
      .channel("admin-chat-list")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        () => router.refresh()
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "chat_messages" },
        () => router.refresh()
      )
      .subscribe();

    const poll = setInterval(() => router.refresh(), 10_000);

    return () => {
      clearInterval(poll);
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
                  ? `${lastMessage.sender_role === "admin" ? "You: " : ""}${
                      lastMessage.body ||
                      (lastMessage.media_url
                        ? lastMessage.media_url.includes("/video/upload/")
                          ? "🎥 Video"
                          : "📷 Image"
                        : "")
                    }`
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
