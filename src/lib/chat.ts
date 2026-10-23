import type { createServiceClient } from "@/lib/supabase/server";

export const CHAT_MAX_LENGTH = 2000;

// Generous on purpose — this is a real signed-in customer or the single
// admin, not an anonymous public room, so spam risk is low.
export const CHAT_RATE_LIMIT_MAX = 20;
export const CHAT_RATE_LIMIT_WINDOW_MS = 60_000;

export async function isSendingTooFast(
  supabase: ReturnType<typeof createServiceClient>,
  clientId: string
): Promise<boolean> {
  const since = new Date(Date.now() - CHAT_RATE_LIMIT_WINDOW_MS).toISOString();
  const { count } = await supabase
    .from("chat_messages")
    .select("id", { count: "exact", head: true })
    .eq("client_id", clientId)
    .gte("created_at", since);
  return (count ?? 0) >= CHAT_RATE_LIMIT_MAX;
}
