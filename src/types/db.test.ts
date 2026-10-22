import { describe, expect, it } from "vitest";
import { ORDER_STATUS_LABELS, ORDER_STATUS_SEQUENCE } from "./db";

describe("order status data", () => {
  it("has a label for every status in the display sequence", () => {
    for (const status of ORDER_STATUS_SEQUENCE) {
      expect(ORDER_STATUS_LABELS[status]).toBeTruthy();
    }
  });

  it("has a label for every status, including cancelled (not shown in the progress bar)", () => {
    expect(Object.keys(ORDER_STATUS_LABELS)).toContain("cancelled");
    expect(ORDER_STATUS_SEQUENCE).not.toContain("cancelled");
  });

  it("keeps the sequence in forward order with no duplicates", () => {
    expect(new Set(ORDER_STATUS_SEQUENCE).size).toBe(ORDER_STATUS_SEQUENCE.length);
  });
});
