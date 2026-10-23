export function whatsappOrderLink(designTitle: string, reference: string) {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const text = encodeURIComponent(
    `Hi! I'd like to order "${designTitle}" (${reference}).`
  );
  return `https://wa.me/${number}?text=${text}`;
}

export function whatsappGeneralLink() {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const text = encodeURIComponent("Hi! I have a question about SimplyBukky.");
  return `https://wa.me/${number}?text=${text}`;
}

/** Formats a Nigerian phone number like "+2347012141594" as "+234 701 214 1594". */
export function formatPhoneDisplay(phone: string) {
  const digits = phone.replace(/[^\d]/g, "");
  if (digits.startsWith("234") && digits.length === 13) {
    return `+${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`;
  }
  return phone;
}
