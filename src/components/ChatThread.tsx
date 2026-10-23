"use client";

import { useEffect, useRef, useState } from "react";
import { CldUploadButton } from "next-cloudinary";
import { createClient } from "@/lib/supabase/client";
import type { ChatMessage } from "@/types/db";

type PendingMessage = ChatMessage & { pending?: boolean; failed?: boolean };

export function ChatThread({
  clientId,
  role,
  initialMessages,
  otherPartyName,
  sendMessage,
  markRead,
  fetchSince,
}: {
  clientId: string;
  role: "client" | "admin";
  initialMessages: ChatMessage[];
  otherPartyName: string;
  sendMessage: (body: string, mediaUrl?: string | null) => Promise<ChatMessage>;
  markRead: () => Promise<void>;
  fetchSince: (afterIso: string) => Promise<ChatMessage[]>;
}) {
  const [messages, setMessages] = useState<PendingMessage[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [uploadError, setUploadError] = useState(false);
  const [connectionState, setConnectionState] = useState<"connecting" | "live" | "reconnecting">(
    "connecting"
  );
  const listRef = useRef<HTMLDivElement>(null);
  const lastCreatedAtRef = useRef(initialMessages.at(-1)?.created_at ?? "1970-01-01T00:00:00Z");

  const upsert = (incoming: ChatMessage[]) => {
    if (incoming.length === 0) return;
    setMessages((prev) => {
      const byId = new Map(prev.map((m) => [m.id, m]));
      for (const m of incoming) {
        byId.set(m.id, m);
        if (m.created_at > lastCreatedAtRef.current) lastCreatedAtRef.current = m.created_at;
      }
      return Array.from(byId.values()).sort((a, b) => a.created_at.localeCompare(b.created_at));
    });
  };

  const backfill = async () => {
    try {
      const fresh = await fetchSince(lastCreatedAtRef.current);
      upsert(fresh);
    } catch {
      // best-effort; the next backfill (reconnect/focus) will catch up
    }
  };

  useEffect(() => {
    markRead().catch(() => {});

    const supabase = createClient();
    const channel = supabase
      .channel(`chat-${clientId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: `client_id=eq.${clientId}` },
        (payload) => {
          upsert([payload.new as ChatMessage]);
          if ((payload.new as ChatMessage).sender_role !== role) {
            markRead().catch(() => {});
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setConnectionState("live");
          backfill();
        } else if (status === "CLOSED" || status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setConnectionState("reconnecting");
        }
      });

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        backfill();
        markRead().catch(() => {});
      }
    };
    const onOnline = () => backfill();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("online", onOnline);

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("online", onOnline);
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const doSend = async (body: string, mediaUrl?: string | null) => {
    if (sending) return;
    const tempId = `temp-${crypto.randomUUID()}`;
    const optimistic: PendingMessage = {
      id: tempId,
      client_id: clientId,
      sender_role: role,
      body,
      media_url: mediaUrl ?? null,
      read_by_client: role === "client",
      read_by_admin: role === "admin",
      created_at: new Date().toISOString(),
      pending: true,
    };
    setMessages((prev) => [...prev, optimistic]);
    setDraft("");
    setSending(true);

    try {
      const saved = await sendMessage(body, mediaUrl);
      setMessages((prev) => {
        const withoutTemp = prev.filter((m) => m.id !== tempId);
        if (withoutTemp.some((m) => m.id === saved.id)) return withoutTemp;
        return [...withoutTemp, saved].sort((a, b) => a.created_at.localeCompare(b.created_at));
      });
      if (saved.created_at > lastCreatedAtRef.current) lastCreatedAtRef.current = saved.created_at;
    } catch {
      setMessages((prev) => prev.map((m) => (m.id === tempId ? { ...m, pending: false, failed: true } : m)));
    } finally {
      setSending(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = draft.trim();
    if (!body) return;
    await doSend(body);
  };

  return (
    <div className="flex flex-col h-[70vh] min-h-[420px] rounded-lg border border-accent-soft overflow-hidden">
      <div className="px-4 py-3 border-b border-accent-soft bg-accent-soft/20 flex items-center justify-between">
        <p className="font-medium">{otherPartyName}</p>
        {connectionState !== "live" && (
          <span className="text-xs text-foreground/60">
            {connectionState === "connecting" ? "Connecting…" : "Reconnecting…"}
          </span>
        )}
      </div>

      <div ref={listRef} role="log" aria-live="polite" className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-sm text-foreground/60 text-center mt-8">
            No messages yet — say hello.
          </p>
        )}
        {messages.map((m) => {
          const mine = m.sender_role === role;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap break-words ${
                  mine ? "bg-accent text-white" : "bg-accent-soft/50 text-foreground"
                } ${m.pending ? "opacity-60" : ""}`}
              >
                {m.media_url && (
                  <a href={m.media_url} target="_blank" rel="noopener noreferrer" className="block mb-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={m.media_url}
                      alt="Shared"
                      loading="lazy"
                      className="max-h-64 rounded-lg object-contain bg-black/5"
                    />
                  </a>
                )}
                {m.body}
                <div className={`mt-1 text-[10px] ${mine ? "text-white/70" : "text-foreground/60"}`}>
                  {m.failed
                    ? "Failed to send"
                    : m.pending
                    ? "Sending…"
                    : new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSend} className="border-t border-accent-soft p-3 flex items-center gap-2">
        <CldUploadButton
          uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
          options={{ multiple: false, maxFiles: 1, resourceType: "image" }}
          className="flex-shrink-0 w-9 h-9 rounded-full border border-accent-soft flex items-center justify-center text-foreground/70 hover:bg-accent-soft transition disabled:opacity-50"
          onSuccess={(result) => {
            setUploadError(false);
            if (typeof result.info !== "object" || !result.info || !("secure_url" in result.info)) return;
            doSend(draft.trim(), result.info.secure_url as string);
          }}
          onError={() => setUploadError(true)}
        >
          <span aria-hidden="true">📷</span>
          <span className="sr-only">Attach an image</span>
        </CldUploadButton>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message…"
          maxLength={2000}
          aria-label="Message"
          className="flex-1 rounded-full border border-accent-soft px-4 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={!draft.trim() || sending}
          className="rounded-full bg-accent text-white px-5 py-2 text-sm disabled:opacity-50"
        >
          Send
        </button>
      </form>
      {uploadError && (
        <p className="px-3 pb-2 text-xs text-red-700">Couldn&apos;t upload that image — try again.</p>
      )}
    </div>
  );
}
