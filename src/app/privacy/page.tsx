import { SiteNav, SiteFooter } from "@/components/SiteNav";

export const metadata = {
  title: "Privacy Policy | Tofunmi's Fashion Home",
};

export default function PrivacyPage() {
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

  return (
    <>
      <SiteNav />
      <main className="flex-1 mx-auto max-w-2xl px-6 py-16 w-full">
        <h1 className="font-serif text-2xl mb-2">Privacy Policy</h1>
        <p className="text-sm text-foreground/60 mb-10">Last updated {new Date().toLocaleDateString()}</p>

        <div className="space-y-8 text-foreground/80 leading-relaxed">
          <section>
            <h2 className="font-medium text-foreground mb-2">What we collect</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Your name, phone number, and email address, when you place an order or join the waitlist.</li>
              <li>Order details: design chosen, fabric preference, delivery date, and any notes you add.</li>
              <li>Measurements, if you submit them yourself instead of being measured at a fitting.</li>
              <li>If you sign in to track your orders, your name and email as shared by Google (or whichever email you use to sign in), and your order history.</li>
              <li>Basic, anonymous page-visit analytics (which pages are viewed), with no advertising trackers.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-medium text-foreground mb-2">Why we collect it</h2>
            <p>
              Solely to process and fulfil your order — to contact you about pricing, fitting, and delivery,
              and to keep a record of your order history if you create an account. We do not use your
              information for advertising, and we do not sell or share it with third parties for marketing.
            </p>
          </section>

          <section>
            <h2 className="font-medium text-foreground mb-2">Who can see it</h2>
            <p>
              Only Tofunmi, as the business owner, has access to client and order records. Your data is
              stored with our database and authentication provider (Supabase) and our image hosting
              provider (Cloudinary); order emails are sent through our email provider (Resend). None of
              these providers use your data for their own purposes — they only process it on our behalf
              to run the site.
            </p>
          </section>

          <section>
            <h2 className="font-medium text-foreground mb-2">How long we keep it</h2>
            <p>
              We keep order and client records to maintain your order history and for basic business
              record-keeping. If you&apos;d like your data corrected or deleted, contact us using the
              details below and we&apos;ll action it.
            </p>
          </section>

          <section>
            <h2 className="font-medium text-foreground mb-2">Cookies</h2>
            <p>
              We use a cookie to keep you signed in if you create an account, and an anonymous analytics
              cookie to understand site traffic. We don&apos;t use third-party advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="font-medium text-foreground mb-2">Your rights</h2>
            <p>
              Under the Nigeria Data Protection Act, you can ask us what data we hold about you, ask us to
              correct it, or ask us to delete it. Contact us any time using the details below.
            </p>
          </section>

          <section>
            <h2 className="font-medium text-foreground mb-2">Contact</h2>
            <p>
              Questions about this policy or your data? Reach us at{" "}
              {email ? (
                <a href={`mailto:${email}`} className="underline transition hover:opacity-70">
                  {email}
                </a>
              ) : (
                "the email address in our site footer"
              )}
              .
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
