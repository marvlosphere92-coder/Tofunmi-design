import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ChatThread } from "@/components/ChatThread";
import { sendAdminChatMessage, markChatReadByAdmin, fetchAdminChatSince } from "../actions";
import type { Client, ChatMessage, CapacitySettings } from "@/types/db";

export default async function AdminChatThreadPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const supabase = await createClient();

  const [{ data: client }, { data: messages }, { data: capacity }] = await Promise.all([
    supabase.from("clients").select("*").eq("id", clientId).single(),
    supabase
      .from("chat_messages")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: true }),
    supabase.from("capacity_settings").select("*").single(),
  ]);

  if (!client) notFound();
  const c = client as Client;
  const receiptsEnabled = (capacity as CapacitySettings | null)?.chat_read_receipts_enabled ?? true;

  return (
    <div>
      <Link href="/admin/chat" className="text-sm text-foreground/70 hover:text-accent transition mb-4 inline-block">
        ← All conversations
      </Link>
      <h1 className="font-serif text-2xl mb-1">{c.full_name}</h1>
      <p className="text-sm text-foreground/70 mb-6">{c.phone}</p>
      <ChatThread
        clientId={clientId}
        role="admin"
        initialMessages={(messages ?? []) as ChatMessage[]}
        otherPartyName={c.full_name}
        sendMessage={sendAdminChatMessage.bind(null, clientId)}
        markRead={markChatReadByAdmin.bind(null, clientId)}
        fetchSince={fetchAdminChatSince.bind(null, clientId)}
        receiptsEnabled={receiptsEnabled}
      />
    </div>
  );
}
