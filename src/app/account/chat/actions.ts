"use server";

import { revalidatePath } from "next/cache";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getSignedInClient } from "@/app/account/actions";
import { CHAT_MAX_LENGTH, isAllowedChatMediaUrl, isSendingTooFast } from "@/lib/chat";
import { sendAdminNotification } from "@/lib/resend";
import type { ChatMessage } from "@/types/db";

export async function sendClientChatMessage(body: string, mediaUrl?: string | null): Promise<ChatMessage> {
  const session = await createClient();
  const { data: userData } = await session.auth.getUser();
  if (!userData.user) throw new Error("Not signed in.");

  const trimmed = body.trim();
  if (trimmed.length > CHAT_MAX_LENGTH) {
    throw new Error("Message must be under 2000 characters.");
  }
  if (!trimmed && !mediaUrl) {
    throw new Error("Message can't be empty.");
  }
  if (mediaUrl && !isAllowedChatMediaUrl(mediaUrl)) {
    throw new Error("Invalid attachment.");
  }

  const supabase = createServiceClient();
  const clientId = await getSignedInClient(userData.user.id);
  if (!clientId) throw new Error("No account found for this session.");

  if (await isSendingTooFast(supabase, clientId)) {
    throw new Error("Sending too fast — slow down a little.");
  }

  const { data: client } = await supabase
    .from("clients")
    .select("full_name")
    .eq("id", clientId)
    .single();

  const { data: message, error } = await supabase
    .from("chat_messages")
    .insert({
      client_id: clientId,
      sender_role: "client",
      body: trimmed,
      media_url: mediaUrl || null,
      read_by_client: true,
      read_by_admin: false,
    })
    .select()
    .single();

  if (error || !message) throw new Error("Could not send message.");

  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  await sendAdminNotification({
    subject: `New chat message from ${client?.full_name ?? "a customer"}`,
    text: `${client?.full_name ?? "A customer"} says: "${
      trimmed || (mediaUrl?.includes("/video/upload/") ? "[Video]" : "[Image]")
    }"\n\nReply here: ${base}/admin/chat/${clientId}`,
  });

  revalidatePath("/account/chat");
  return message as ChatMessage;
}

export async function markChatReadByClient() {
  const session = await createClient();
  const { data: userData } = await session.auth.getUser();
  if (!userData.user) return;

  const supabase = createServiceClient();
  const clientId = await getSignedInClient(userData.user.id);
  if (!clientId) return;

  await supabase
    .from("chat_messages")
    .update({ read_by_client: true })
    .eq("client_id", clientId)
    .eq("sender_role", "admin")
    .eq("read_by_client", false);

  revalidatePath("/account/chat");
}

// Backfill helper: called after the Realtime channel reaches SUBSCRIBED and
// on reconnect/visibility-change, so messages that land in the gap between
// the initial fetch and a live subscription are never silently lost.
export async function fetchClientChatSince(afterIso: string): Promise<ChatMessage[]> {
  const session = await createClient();
  const { data: userData } = await session.auth.getUser();
  if (!userData.user) return [];

  const supabase = createServiceClient();
  const clientId = await getSignedInClient(userData.user.id);
  if (!clientId) return [];

  const { data } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("client_id", clientId)
    .gt("created_at", afterIso)
    .order("created_at", { ascending: true });

  return (data ?? []) as ChatMessage[];
}
