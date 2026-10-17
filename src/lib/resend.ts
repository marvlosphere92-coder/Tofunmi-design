import { Resend } from "resend";

export async function sendOrderStatusEmail(opts: {
  to: string;
  clientName: string;
  orderReference: string;
  status: string;
}) {
  if (!process.env.RESEND_API_KEY) return; // not configured yet, skip silently

  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: process.env.RESEND_FROM || "onboarding@resend.dev",
    to: opts.to,
    subject: `Order ${opts.orderReference} update`,
    text: `Hi ${opts.clientName}, your order ${opts.orderReference} is now: ${opts.status.replace(/_/g, " ")}.`,
  });
}
