"use client";

import { useEffect } from "react";
import { track } from "@vercel/analytics";

export function OrderCompletedTracker({ reference }: { reference?: string }) {
  useEffect(() => {
    if (reference) track("order_completed", { reference });
  }, [reference]);

  return null;
}
