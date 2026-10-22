import { describe, expect, it } from "vitest";
import { whatsappOrderLink } from "./whatsapp";

describe("whatsappOrderLink", () => {
  it("builds a wa.me link with the configured number", () => {
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER = "2347012141594";
    const link = whatsappOrderLink("Colorblock Peplum Dress", "MS-0011");
    expect(link.startsWith("https://wa.me/2347012141594?text=")).toBe(true);
  });

  it("URL-encodes the design title and reference into the message", () => {
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER = "2347012141594";
    const link = whatsappOrderLink("Gold & Silk Gown", "MS-0099");
    const decoded = decodeURIComponent(link.split("text=")[1]);
    expect(decoded).toBe('Hi! I\'d like to order "Gold & Silk Gown" (MS-0099).');
  });
});
