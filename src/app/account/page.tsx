import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { EmailSignInForm } from "@/components/EmailSignInForm";
import { SubmitButton } from "@/components/SubmitButton";
import { SinglePhotoUploadField } from "@/components/SinglePhotoUploadField";
import { EditableBuyerReview } from "@/components/EditableBuyerReview";
import { signOutCustomer, submitBuyerReview, updateBuyerReview } from "./actions";
import { ORDER_STATUS_LABELS, ORDER_STATUS_SEQUENCE } from "@/types/db";
import type { Client, Review } from "@/types/db";

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
          <p className="mt-1 text-sm text-foreground/50">
            New here? There&apos;s no separate sign-up — signing in creates your account.
          </p>
          <GoogleSignInButton className="mt-8 inline-block rounded-full bg-accent text-white px-8 py-3" />
          <div className="mt-8 max-w-xs mx-auto">
            <p className="text-xs uppercase tracking-wide text-foreground/50 mb-3">
              Or, without Google
            </p>
            <EmailSignInForm />
          </div>
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
          "id, reference, status, event_date, created_at, estimated_price, final_price, designs(title, cover_photo_url), order_status_events(status, created_at)"
        )
        .eq("client_id", c.id)
        .order("created_at", { ascending: false })
    : { data: null };

  const { data: myReviews } = c
    ? await supabase.from("reviews").select("*").eq("client_id", c.id)
    : { data: null };
  const reviewsByOrder = new Map((myReviews ?? []).map((r) => [r.order_id, r as Review]));

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
                    <p className="text-sm text-foreground/60">
                      {o.final_price != null
                        ? `Price: ₦${o.final_price.toLocaleString()}`
                        : o.estimated_price != null
                        ? `Estimated price: ₦${o.estimated_price.toLocaleString()}`
                        : "Price to be confirmed on WhatsApp"}
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

                {o.status === "completed" && (
                  <div className="mt-5 border-t border-accent-soft pt-4">
                    {reviewsByOrder.has(o.id) ? (
                      <EditableBuyerReview review={reviewsByOrder.get(o.id)!} action={updateBuyerReview} />
                    ) : (
                      <form action={submitBuyerReview} className="space-y-2">
                        <input type="hidden" name="orderId" value={o.id} />
                        <p className="text-sm font-medium">Leave a review</p>
                        <select
                          name="rating"
                          required
                          defaultValue="5"
                          className="rounded-md border border-accent-soft px-3 py-2 text-sm"
                        >
                          {[5, 4, 3, 2, 1].map((n) => (
                            <option key={n} value={n}>
                              {n} star{n === 1 ? "" : "s"}
                            </option>
                          ))}
                        </select>
                        <textarea
                          name="body"
                          placeholder="How was it?"
                          className="w-full rounded-md border border-accent-soft px-3 py-2 text-sm"
                          rows={2}
                        />
                        <SinglePhotoUploadField />
                        <SubmitButton
                          className="rounded-full bg-accent text-white px-5 py-2 text-sm"
                          pendingText="Submitting…"
                        >
                          Submit review
                        </SubmitButton>
                      </form>
                    )}
                  </div>
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
