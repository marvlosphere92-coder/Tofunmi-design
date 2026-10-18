import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return <>{children}</>; // login page itself, proxy already redirects other routes
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-accent-soft">
        <nav className="mx-auto max-w-5xl flex flex-wrap items-center gap-x-4 gap-y-2 px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm flex-1">
            <Link href="/admin" className="font-medium transition hover:opacity-70">Dashboard</Link>
            <Link href="/admin/orders" className="transition hover:opacity-70">Orders</Link>
            <Link href="/admin/designs" className="transition hover:opacity-70">Designs</Link>
            <Link href="/admin/materials" className="transition hover:opacity-70">Materials</Link>
            <Link href="/admin/account" className="transition hover:opacity-70">Account</Link>
          </div>
          <form action={signOut}>
            <SubmitButton className="text-sm underline" pendingText="Signing out…">
              Sign out
            </SubmitButton>
          </form>
        </nav>
      </header>
      <main className="flex-1 mx-auto max-w-5xl w-full px-4 sm:px-6 py-10">{children}</main>
    </div>
  );
}
