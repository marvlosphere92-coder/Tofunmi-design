import Link from "next/link";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { OrderCompletedTracker } from "@/components/OrderCompletedTracker";

export default async function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string; name?: string; id?: string }>;
}) {
  const { ref, name, id } = await searchParams;
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const text = encodeURIComponent(
    `Hi, I just sent an order request (${ref ?? ""}) on the website. My name is ${name ?? ""}.`
  );

  return (
    <>
      <SiteNav />
      <OrderCompletedTracker reference={ref} />
      <main className="flex-1 mx-auto max-w-lg px-6 py-20 text-center">
        <h1 className="font-serif text-2xl">Request received</h1>
        <p className="mt-3 text-foreground/70">
          Your reference is <span className="font-medium">{ref}</span>. We&apos;ll
          confirm details and pricing with you on WhatsApp.
        </p>
        <a
          href={`https://wa.me/${whatsappNumber}?text=${text}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-block rounded-full bg-accent text-white px-8 py-3 shadow-sm transition hover:opacity-90 hover:shadow-lg hover:-translate-y-0.5 active:scale-95"
        >
          Message us on WhatsApp now
        </a>
        {id && (
          <div className="mt-4">
            <Link href={`/order/manage/${id}`} className="text-sm underline transition hover:opacity-70">
              Need to change your delivery date or notes? Manage your order
            </Link>
          </div>
        )}
        <div className="mt-6">
          <Link href="/designs" className="text-sm underline transition hover:opacity-70">
            Back to the lookbook
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
