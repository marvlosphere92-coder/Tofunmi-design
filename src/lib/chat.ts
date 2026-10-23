import type { createServiceClient } from "@/lib/supabase/server";

export const CHAT_MAX_LENGTH = 2000;

// Generous on purpose — this is a real signed-in customer or the single
// admin, not an anonymous public room, so spam risk is low.
export const CHAT_RATE_LIMIT_MAX = 20;
export const CHAT_RATE_LIMIT_WINDOW_MS = 60_000;

// Pinned to our own Cloudinary account's path, not just the host — a bare
// res.cloudinary.com check would accept any tenant's uploaded files.
export function isAllowedChatMediaUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    return (
      parsed.protocol === "https:" &&
      parsed.hostname === "res.cloudinary.com" &&
      Boolean(cloudName) &&
      parsed.pathname.startsWith(`/${cloudName}/`)
    );
  } catch {
    return false;
  }
}

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
