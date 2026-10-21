import { createServiceClient } from "@/lib/supabase/server";

// Links a signed-in customer to their `clients` row: reuses one already
// linked, adopts a matching guest record by email (Google has already
// verified that email, so this is a safe match), or creates a new one.
export async function linkClientAccount(user: {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
}): Promise<string | null> {
  if (!user.email) return null;
  const supabase = createServiceClient();

  const { data: linked } = await supabase
    .from("clients")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (linked) return linked.id;

  const { data: guestMatch } = await supabase
    .from("clients")
    .select("id")
    .eq("email", user.email)
    .is("user_id", null)
    .limit(1)
    .maybeSingle();

  if (guestMatch) {
    await supabase.from("clients").update({ user_id: user.id }).eq("id", guestMatch.id);
    return guestMatch.id;
  }

  const fullName =
    (user.user_metadata?.full_name as string | undefined) ||
    (user.user_metadata?.name as string | undefined) ||
    user.email;

  const { data: created } = await supabase
    .from("clients")
    .insert({ user_id: user.id, full_name: fullName, email: user.email })
    .select("id")
    .single();

  return created?.id ?? null;
}
