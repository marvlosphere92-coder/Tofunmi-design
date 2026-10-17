import Link from "next/link";
import { SiteNav, SiteFooter } from "@/components/SiteNav";

export default async function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string; name?: string }>;
}) {
  const { ref, name } = await searchParams;
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const text = encodeURIComponent(
    `Hi, I just sent an order request (${ref ?? ""}) on the website. My name is ${name ?? ""}.`
  );

  return (
    <>
      <SiteNav />
      <main className="flex-1 mx-auto max-w-lg px-6 py-20 text-center">
        <h1 className="font-serif text-2xl">Request received</h1>
        <p className="mt-3 text-foreground/70">
          Your reference is <span className="font-medium">{ref}</span>. She&apos;ll
          confirm details and pricing with you on WhatsApp.
        </p>
        <a
          href={`https://wa.me/${whatsappNumber}?text=${text}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-block rounded-full bg-accent text-white px-8 py-3"
        >
          Message her on WhatsApp now
        </a>
        <div className="mt-6">
          <Link href="/designs" className="text-sm underline">
            Back to the lookbook
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
