import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";
import { AdminNavLinks } from "@/components/admin/AdminNavLinks";
import type { CapacitySettings } from "@/types/db";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const isAdmin = data.user?.app_metadata?.role === "admin";

  if (!isAdmin) {
    return <>{children}</>; // login page itself, proxy already redirects other routes
  }

  const [{ data: capacity }, { count: chatUnreadCount }] = await Promise.all([
    supabase.from("capacity_settings").select("*").single(),
    supabase
      .from("chat_messages")
      .select("id", { count: "exact", head: true })
      .eq("sender_role", "client")
      .eq("read_by_admin", false),
  ]);
  const accepting = (capacity as CapacitySettings | null)?.accepting_orders ?? true;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="bg-plum text-white">
        <div className="mx-auto max-w-5xl flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 sm:px-6 py-3">
          <p className="font-serif text-lg tracking-wide">SimplyBukky</p>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              accepting ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"
            }`}
          >
            {accepting ? "● Accepting orders" : "● Closed"}
          </span>
        </div>
        <nav className="mx-auto max-w-5xl flex flex-wrap items-center gap-x-4 gap-y-2 px-4 sm:px-6 py-3 border-t border-white/10">
          <AdminNavLinks chatUnreadCount={chatUnreadCount ?? 0} />
          <form action={signOut}>
            <SubmitButton className="text-sm text-white/80 underline hover:text-white" pendingText="Signing out…">
              Sign out
            </SubmitButton>
          </form>
        </nav>
      </header>
      <main className="flex-1 mx-auto max-w-5xl w-full px-4 sm:px-6 py-10">{children}</main>
    </div>
  );
}
