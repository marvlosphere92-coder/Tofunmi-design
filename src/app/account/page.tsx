import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { AuthTabs } from "@/components/AuthTabs";
import { Avatar } from "@/components/Avatar";
import { ProfileEditForm } from "@/components/ProfileEditForm";
import { SubmitButton } from "@/components/SubmitButton";
import { ConfirmDeleteForm } from "@/components/ConfirmDeleteForm";
import { SinglePhotoUploadField } from "@/components/SinglePhotoUploadField";
import { EditableBuyerReview } from "@/components/EditableBuyerReview";
import {
  signOutCustomer,
  submitBuyerReview,
  updateBuyerReview,
  updateProfile,
  toggleSavedDesign,
} from "./actions";
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
          <h1 className="font-serif text-2xl mb-6">Your account</h1>
          <AuthTabs />
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
  const firstName = c?.full_name?.trim().split(" ")[0] || "there";

  const [{ data: orders }, { data: myReviews }, { data: savedRows }] = await Promise.all([
    c
      ? supabase
          .from("orders")
          .select(
            "id, reference, status, event_date, created_at, estimated_price, final_price, designs(title, cover_photo_url), order_status_events(status, created_at)"
          )
          .eq("client_id", c.id)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: null }),
    c ? supabase.from("reviews").select("*").eq("client_id", c.id) : Promise.resolve({ data: null }),
    c
      ? supabase.from("saved_designs").select("id, designs(id, title, cover_photo_url, labour_price)")
      : Promise.resolve({ data: null }),
  ]);

  const reviewsByOrder = new Map((myReviews ?? []).map((r) => [r.order_id, r as Review]));
  const orderList = orders ?? [];
  const completedCount = orderList.filter((o) => o.status === "completed").length;
  const savedDesigns = (savedRows ?? [])
    .map((r) => r.designs as unknown as { id: string; title: string; cover_photo_url: string | null; labour_price: number | null } | null)
    .filter((d): d is NonNullable<typeof d> => d != null);

  return (
    <>
      <SiteNav />
      <main className="flex-1 mx-auto max-w-2xl px-6 py-16 w-full">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar name={c?.full_name || user.email || "?"} className="w-14 h-14 text-xl" />
            <div>
              <h1 className="font-serif text-2xl">Welcome back, {firstName}</h1>
              <p className="text-sm text-foreground/70 mt-1">{user.email}</p>
            </div>
          </div>
          <form action={signOutCustomer}>
            <SubmitButton className="text-sm underline" pendingText="Signing out…">
              Sign out
            </SubmitButton>
          </form>
        </div>

        {orderList.length > 0 && (
          <div className="mt-6 flex gap-6 text-sm text-foreground/70">
            <p>
              <span className="font-medium text-foreground">{orderList.length}</span> order
              {orderList.length === 1 ? "" : "s"}
            </p>
            <p>
              <span className="font-medium text-foreground">{completedCount}</span> completed
            </p>
          </div>
        )}

        {c && (
          <section className="mt-10 rounded-lg border border-accent-soft p-5">
            <h2 className="font-medium mb-3">Your details</h2>
            <ProfileEditForm fullName={c.full_name} phone={c.phone} action={updateProfile} />
          </section>
        )}

        <h2 className="font-medium mt-10 mb-4">Your orders</h2>
        <div className="space-y-4">
          {orderList.map((o) => {
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
                    <p className="text-sm text-foreground/70">
                      {o.event_date
                        ? `Delivery date: ${new Date(o.event_date).toLocaleDateString()}`
                        : "No delivery date set yet"}
                    </p>
                    <p className="text-sm text-foreground/70">
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
                            : "bg-accent-soft text-foreground/70"
                        }`}
                      >
                        {ORDER_STATUS_LABELS[status]}
                      </li>
                    ))}
                  </ol>
                )}

                {events.length > 0 && (
                  <p className="mt-3 text-xs text-foreground/70">
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
          {orderList.length === 0 && (
            <p className="text-foreground/70">
              No orders yet.{" "}
              <Link href="/designs" className="underline transition hover:opacity-70">
                Browse the lookbook
              </Link>
              .
            </p>
          )}
        </div>

        {savedDesigns.length > 0 && (
          <>
            <h2 id="saved" className="font-medium mt-10 mb-4 scroll-mt-24">
              Saved designs
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {savedDesigns.map((d) => (
                <div key={d.id} className="relative group">
                  <Link href={`/designs/${d.id}`} className="block">
                    <div className="aspect-[3/4] overflow-hidden rounded-lg bg-accent-soft">
                      {d.cover_photo_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={d.cover_photo_url}
                          alt={d.title}
                          className="h-full w-full object-cover transition group-hover:scale-105"
                        />
                      )}
                    </div>
                    <p className="mt-2 text-sm">{d.title}</p>
                    <p className="text-xs text-foreground/70">
                      {d.labour_price != null ? `From ₦${d.labour_price.toLocaleString()}` : "Price on request"}
                    </p>
                  </Link>
                  <ConfirmDeleteForm
                    action={toggleSavedDesign}
                    hiddenFields={{ designId: d.id, saved: "true" }}
                    confirmMessage={`Remove "${d.title}" from your saved designs?`}
                    label="×"
                    className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-black/60 text-white text-sm leading-none transition hover:bg-black/80"
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
