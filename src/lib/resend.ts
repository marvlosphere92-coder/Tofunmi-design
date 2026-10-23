import { Resend } from "resend";
import { createServiceClient } from "@/lib/supabase/server";

// Fallback used only if the admin lookup below fails or returns nobody.
const FALLBACK_ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.NEXT_PUBLIC_CONTACT_EMAIL;

// Every account with app_metadata.role === 'admin' — there's more than one
// (e.g. Tofunmi and the person managing the site), and all of them should
// hear about new signups, order requests, and chat messages.
async function getAdminEmails(): Promise<string[]> {
  try {
    const supabase = createServiceClient();
    const { data } = await supabase.auth.admin.listUsers();
    const emails = data.users
      .filter((u) => u.app_metadata?.role === "admin" && u.email)
      .map((u) => u.email as string);
    return emails.length > 0 ? emails : FALLBACK_ADMIN_EMAIL ? [FALLBACK_ADMIN_EMAIL] : [];
  } catch {
    return FALLBACK_ADMIN_EMAIL ? [FALLBACK_ADMIN_EMAIL] : [];
  }
}

// Email is a side effect, never a reason to fail the sign-up/order action
// that triggered it, so failures are logged and swallowed here.
async function sendEmail(opts: { to: string; subject: string; text: string }) {
  if (!process.env.RESEND_API_KEY) return; // not configured yet, skip silently
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.RESEND_FROM || "onboarding@resend.dev",
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
    });
  } catch (err) {
    console.error("Failed to send email:", opts.subject, err);
  }
}

export async function sendAdminNotification(opts: { subject: string; text: string }) {
  const emails = await getAdminEmails();
  await Promise.all(emails.map((to) => sendEmail({ to, subject: opts.subject, text: opts.text })));
}

export async function sendWelcomeEmail(opts: { to: string; name: string }) {
  await sendEmail({
    to: opts.to,
    subject: "Welcome to SimplyBukky",
    text: [
      `Hi ${opts.name}, welcome to SimplyBukky!`,
      "Your account is set up. Browse the lookbook, save pieces you like, and request an order whenever you're ready — you'll be able to track it from your account page.",
    ].join("\n\n"),
  });
  await sendAdminNotification({
    subject: "New customer signup",
    text: `${opts.name} (${opts.to}) just created an account on SimplyBukky.`,
  });
}

export async function sendChatMessageEmail(opts: {
  to: string;
  recipientName: string;
  senderName: string;
  body: string;
  chatUrl: string;
}) {
  await sendEmail({
    to: opts.to,
    subject: `New message from ${opts.senderName}`,
    text: [
      `Hi ${opts.recipientName}, you have a new message on SimplyBukky:`,
      `"${opts.body}"`,
      `Reply here: ${opts.chatUrl}`,
    ].join("\n\n"),
  });
}

export async function sendOrderStatusEmail(opts: {
  to: string;
  clientName: string;
  orderReference: string;
  status: string;
  manageUrl?: string;
}) {
  const lines = [
    `Hi ${opts.clientName}, your order ${opts.orderReference} is now: ${opts.status.replace(/_/g, " ")}.`,
  ];
  if (opts.manageUrl) {
    lines.push(`Need to change your delivery date or notes? ${opts.manageUrl}`);
  }

  await sendEmail({ to: opts.to, subject: `Order ${opts.orderReference} update`, text: lines.join("\n\n") });
}

export async function sendOrderDetailsUpdatedEmail(opts: {
  to: string;
  clientName: string;
  orderReference: string;
  changedBy: "admin" | "client";
  eventDate?: string | null;
  budgetNote?: string | null;
}) {
  const lines = [`Hi ${opts.clientName}, the details on order ${opts.orderReference} were just updated`];
  lines.push(opts.changedBy === "admin" ? "by the designer." : "— here's a copy for your records.");
  if (opts.eventDate) lines.push(`Delivery date: ${opts.eventDate}`);
  if (opts.budgetNote) lines.push(`Notes: ${opts.budgetNote}`);

  await sendEmail({
    to: opts.to,
    subject: `Order ${opts.orderReference} details updated`,
    text: lines.join("\n"),
  });
}
