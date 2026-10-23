"use client";

import { useState } from "react";
import type { Material } from "@/types/db";

export function OrderFabricFields({ materials }: { materials: Material[] }) {
  const [ownFabric, setOwnFabric] = useState(false);

  return (
    <>
      <label className="flex items-center gap-3 min-h-11 text-sm cursor-pointer">
        <input
          type="checkbox"
          name="ownFabric"
          checked={ownFabric}
          onChange={(e) => setOwnFabric(e.target.checked)}
          className="w-5 h-5 accent-accent flex-shrink-0"
        />
        I&apos;ll bring my own fabric
      </label>
      <div>
        <label htmlFor="materialId" className="block text-sm font-medium mb-1">
          Or choose a fabric from our catalog
        </label>
        <select
          id="materialId"
          name="materialId"
          disabled={ownFabric}
          className="w-full rounded-md border border-accent-soft px-3 py-2 text-base disabled:bg-accent-soft/30 disabled:text-foreground/50"
        >
          <option value="">Choose a fabric from our catalog</option>
          {materials.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} — ₦{m.price_per_yard.toLocaleString()}/yard
            </option>
          ))}
        </select>
      </div>
      <p className="text-xs text-foreground/70">
        Final price depends on exact yardage needed for your size — we&apos;ll confirm before the
        deposit.
      </p>
    </>
  );
}
