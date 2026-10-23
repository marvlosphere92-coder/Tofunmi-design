import { createClient } from "@/lib/supabase/server";
import { AdminChatList } from "@/components/admin/AdminChatList";
import { ReadReceiptsToggle } from "@/components/admin/ReadReceiptsToggle";
import { setChatReadReceiptsEnabled } from "./actions";
import type { Client, ChatMessage, CapacitySettings } from "@/types/db";

export default async function AdminChatPage() {
  const supabase = await createClient();

  const [{ data: clients }, { data: messages }, { data: capacity }] = await Promise.all([
    supabase.from("clients").select("*").order("created_at", { ascending: false }),
    supabase.from("chat_messages").select("*").order("created_at", { ascending: false }),
    supabase.from("capacity_settings").select("*").single(),
  ]);
  const receiptsEnabled = (capacity as CapacitySettings | null)?.chat_read_receipts_enabled ?? true;

  const allMessages = (messages ?? []) as ChatMessage[];
  const lastMessageByClient = new Map<string, ChatMessage>();
  const unreadByClient = new Map<string, number>();
  for (const m of allMessages) {
    if (!lastMessageByClient.has(m.client_id)) lastMessageByClient.set(m.client_id, m);
    if (m.sender_role === "client" && !m.read_by_admin) {
      unreadByClient.set(m.client_id, (unreadByClient.get(m.client_id) ?? 0) + 1);
    }
  }

  const threads = ((clients ?? []) as Client[])
    .map((c) => ({
      client: c,
      lastMessage: lastMessageByClient.get(c.id) ?? null,
      unread: unreadByClient.get(c.id) ?? 0,
    }))
    .sort((a, b) => {
      if (!a.lastMessage && !b.lastMessage) return a.client.full_name.localeCompare(b.client.full_name);
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return b.lastMessage.created_at.localeCompare(a.lastMessage.created_at);
    });

  return (
    <div>
      <h1 className="font-serif text-2xl mb-3">Messages</h1>
      <div className="mb-6">
        <ReadReceiptsToggle enabled={receiptsEnabled} action={setChatReadReceiptsEnabled} />
      </div>
      <AdminChatList threads={threads} />
    </div>
  );
}
