import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { SubmitButton } from "@/components/SubmitButton";
import { signOutCustomer } from "./actions";
import { ORDER_STATUS_LABELS, ORDER_STATUS_SEQUENCE } from "@/types/db";
import type { Client } from "@/types/db";

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    return (
      <>
        <SiteNav />
        <main className="flex-1 mx-auto max-w-md px-6 py-20 text-center">
          <h1 className="font-serif text-2xl">Your account</h1>
          <p className="mt-3 text-foreground/70">
            Sign in to track your orders and see where each piece is in progress.
          </p>
          <GoogleSignInButton className="mt-8 inline-block rounded-full bg-accent text-white px-8 py-3" />
        </main>
        <SiteFooter />
      </>
    );
  }

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const c = client as Client | null;

  const { data: orders } = c
    ? await supabase
        .from("orders")
        .select(
          "id, reference, status, event_date, created_at, designs(title, cover_photo_url), order_status_events(status, created_at)"
        )
        .eq("client_id", c.id)
        .order("created_at", { ascending: false })
    : { data: null };

  return (
    <>
      <SiteNav />
      <main className="flex-1 mx-auto max-w-2xl px-6 py-16 w-full">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl">Your account</h1>
            <p className="text-sm text-foreground/60 mt-1">{user.email}</p>
          </div>
          <form action={signOutCustomer}>
            <SubmitButton className="text-sm underline" pendingText="Signing out…">
              Sign out
            </SubmitButton>
          </form>
        </div>

        <h2 className="font-medium mt-10 mb-4">Your orders</h2>
        <div className="space-y-4">
          {(orders ?? []).map((o) => {
            const design = o.designs as unknown as { title: string; cover_photo_url: string | null } | null;
            const events = (o.order_status_events ?? []) as { status: string; created_at: string }[];
            const stepIndex = ORDER_STATUS_SEQUENCE.indexOf(o.status as (typeof ORDER_STATUS_SEQUENCE)[number]);

            return (
              <div key={o.id} className="rounded-lg border border-accent-soft p-5">
                <div className="flex items-center gap-3">
                  {design?.cover_photo_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={design.cover_photo_url}
                      alt=""
                      className="w-14 h-14 rounded-md object-cover flex-shrink-0"
                    />
                  )}
                  <div>
                    <p className="font-medium">
                      {o.reference} — {design?.title ?? "—"}
                    </p>
                    <p className="text-sm text-foreground/60">
                      {o.event_date
                        ? `Delivery date: ${new Date(o.event_date).toLocaleDateString()}`
                        : "No delivery date set yet"}
                    </p>
                  </div>
                </div>

                {o.status === "cancelled" ? (
                  <p className="mt-4 text-sm text-red-700">This order was cancelled.</p>
                ) : (
                  <ol className="mt-5 flex flex-wrap gap-x-2 gap-y-2 text-xs">
                    {ORDER_STATUS_SEQUENCE.map((status, i) => (
                      <li
                        key={status}
                        className={`rounded-full px-3 py-1 ${
                          i <= stepIndex
                            ? "bg-accent text-white"
                            : "bg-accent-soft text-foreground/50"
                        }`}
                      >
                        {ORDER_STATUS_LABELS[status]}
                      </li>
                    ))}
                  </ol>
                )}

                {events.length > 0 && (
                  <p className="mt-3 text-xs text-foreground/50">
                    Last updated{" "}
                    {new Date(events[events.length - 1].created_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            );
          })}
          {(!orders || orders.length === 0) && (
            <p className="text-foreground/60">
              No orders yet.{" "}
              <Link href="/designs" className="underline transition hover:opacity-70">
                Browse the lookbook
              </Link>
              .
            </p>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
