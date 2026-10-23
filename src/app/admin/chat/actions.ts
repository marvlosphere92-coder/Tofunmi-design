"use server";

import { revalidatePath } from "next/cache";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { CHAT_MAX_LENGTH } from "@/lib/chat";
import { sendChatMessageEmail } from "@/lib/resend";
import type { ChatMessage } from "@/types/db";

async function requireAdmin() {
  const session = await createClient();
  const { data } = await session.auth.getUser();
  if (data.user?.app_metadata?.role !== "admin") throw new Error("Not authorized.");
}

export async function sendAdminChatMessage(clientId: string, body: string): Promise<ChatMessage> {
  await requireAdmin();

  const trimmed = body.trim();
  if (!trimmed || trimmed.length > CHAT_MAX_LENGTH) {
    throw new Error("Message must be between 1 and 2000 characters.");
  }

  const supabase = createServiceClient();
  const { data: client } = await supabase
    .from("clients")
    .select("full_name, email")
    .eq("id", clientId)
    .single();
  if (!client) throw new Error("Customer not found.");

  const { data: message, error } = await supabase
    .from("chat_messages")
    .insert({
      client_id: clientId,
      sender_role: "admin",
      body: trimmed,
      read_by_client: false,
      read_by_admin: true,
    })
    .select()
    .single();

  if (error || !message) throw new Error("Could not send message.");

  if (client.email) {
    const base =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    await sendChatMessageEmail({
      to: client.email,
      recipientName: client.full_name,
      senderName: "SimplyBukky",
      body: trimmed,
      chatUrl: `${base}/account/chat`,
    });
  }

  revalidatePath(`/admin/chat/${clientId}`);
  revalidatePath("/admin/chat");
  return message as ChatMessage;
}

export async function markChatReadByAdmin(clientId: string) {
  await requireAdmin();
  const supabase = createServiceClient();

  await supabase
    .from("chat_messages")
    .update({ read_by_admin: true })
    .eq("client_id", clientId)
    .eq("sender_role", "client")
    .eq("read_by_admin", false);

  revalidatePath(`/admin/chat/${clientId}`);
  revalidatePath("/admin/chat");
}

export async function fetchAdminChatSince(clientId: string, afterIso: string): Promise<ChatMessage[]> {
  await requireAdmin();
  const supabase = createServiceClient();

  const { data } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("client_id", clientId)
    .gt("created_at", afterIso)
    .order("created_at", { ascending: true });

  return (data ?? []) as ChatMessage[];
}
