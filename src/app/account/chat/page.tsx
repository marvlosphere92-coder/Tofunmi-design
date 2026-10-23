import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { ChatThread } from "@/components/ChatThread";
import { getSignedInClient } from "@/app/account/actions";
import { sendClientChatMessage, markChatReadByClient, fetchClientChatSince } from "./actions";
import type { ChatMessage } from "@/types/db";

export default async function AccountChatPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/account");

  const clientId = await getSignedInClient(userData.user.id);
  if (!clientId) redirect("/account");

  const service = createServiceClient();
  const { data: messages } = await service
    .from("chat_messages")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: true });

  return (
    <>
      <SiteNav />
      <main className="flex-1 mx-auto max-w-2xl px-6 py-12 w-full">
        <Link href="/account" className="text-sm text-foreground/70 hover:text-accent transition mb-4 inline-block">
          ← Back to account
        </Link>
        <h1 className="font-serif text-2xl mb-6">Messages</h1>
        <ChatThread
          clientId={clientId}
          role="client"
          initialMessages={(messages ?? []) as ChatMessage[]}
          otherPartyName="SimplyBukky"
          sendMessage={sendClientChatMessage}
          markRead={markChatReadByClient}
          fetchSince={fetchClientChatSince}
        />
      </main>
      <SiteFooter />
    </>
  );
}
