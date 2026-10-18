import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return <>{children}</>; // login page itself, proxy already redirects other routes
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-accent-soft">
        <nav className="mx-auto max-w-5xl flex items-center justify-between px-6 py-4">
          <div className="flex gap-6 text-sm">
            <Link href="/admin" className="font-medium">Dashboard</Link>
            <Link href="/admin/orders">Orders</Link>
            <Link href="/admin/designs">Designs</Link>
            <Link href="/admin/materials">Materials</Link>
          </div>
          <form action={signOut}>
            <button className="text-sm underline">Sign out</button>
          </form>
        </nav>
      </header>
      <main className="flex-1 mx-auto max-w-5xl w-full px-6 py-10">{children}</main>
    </div>
  );
}
