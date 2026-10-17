export function whatsappOrderLink(designTitle: string, reference: string) {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const text = encodeURIComponent(
    `Hi! I'd like to order "${designTitle}" (${reference}).`
  );
  return `https://wa.me/${number}?text=${text}`;
}
