import { Resend } from "resend";

export async function sendOrderStatusEmail(opts: {
  to: string;
  clientName: string;
  orderReference: string;
  status: string;
  manageUrl?: string;
}) {
  if (!process.env.RESEND_API_KEY) return; // not configured yet, skip silently

  const resend = new Resend(process.env.RESEND_API_KEY);
  const lines = [
    `Hi ${opts.clientName}, your order ${opts.orderReference} is now: ${opts.status.replace(/_/g, " ")}.`,
  ];
  if (opts.manageUrl) {
    lines.push(`Need to change your event date or notes? ${opts.manageUrl}`);
  }

  await resend.emails.send({
    from: process.env.RESEND_FROM || "onboarding@resend.dev",
    to: opts.to,
    subject: `Order ${opts.orderReference} update`,
    text: lines.join("\n\n"),
  });
}

export async function sendOrderDetailsUpdatedEmail(opts: {
  to: string;
  clientName: string;
  orderReference: string;
  changedBy: "admin" | "client";
  eventDate?: string | null;
  budgetNote?: string | null;
}) {
  if (!process.env.RESEND_API_KEY) return; // not configured yet, skip silently

  const resend = new Resend(process.env.RESEND_API_KEY);
  const lines = [`Hi ${opts.clientName}, the details on order ${opts.orderReference} were just updated`];
  lines.push(opts.changedBy === "admin" ? "by the designer." : "— here's a copy for your records.");
  if (opts.eventDate) lines.push(`Event date: ${opts.eventDate}`);
  if (opts.budgetNote) lines.push(`Notes: ${opts.budgetNote}`);

  await resend.emails.send({
    from: process.env.RESEND_FROM || "onboarding@resend.dev",
    to: opts.to,
    subject: `Order ${opts.orderReference} details updated`,
    text: lines.join("\n"),
  });
}
