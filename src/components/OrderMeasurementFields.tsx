"use client";

import { useState } from "react";

const fields: [string, string][] = [
  ["bust", "Bust (in)"],
  ["waist", "Waist (in)"],
  ["hip", "Hip (in)"],
  ["shoulder", "Shoulder (in)"],
  ["sleeveLength", "Sleeve length (in)"],
  ["backLength", "Back length (in)"],
  ["inseam", "Inseam (in)"],
];

export function OrderMeasurementFields() {
  const [choice, setChoice] = useState<"designer" | "client">("designer");

  return (
    <>
      <label className="flex items-center gap-3 min-h-11 text-sm cursor-pointer">
        <input
          type="radio"
          name="measurementChoice"
          value="designer"
          checked={choice === "designer"}
          onChange={() => setChoice("designer")}
          className="w-5 h-5 accent-accent flex-shrink-0"
        />
        We&apos;ll measure you at a fitting
      </label>
      <label className="flex items-center gap-3 min-h-11 text-sm cursor-pointer">
        <input
          type="radio"
          name="measurementChoice"
          value="client"
          checked={choice === "client"}
          onChange={() => setChoice("client")}
          className="w-5 h-5 accent-accent flex-shrink-0"
        />
        I&apos;ll submit my own measurements now
      </label>

      {choice === "client" && (
        <div className="grid grid-cols-2 gap-3 pt-2">
          {fields.map(([name, label]) => (
            <label key={name} className="text-xs text-foreground/70">
              {label}
              <input
                name={name}
                type="number"
                step="0.1"
                inputMode="decimal"
                className="block w-full rounded-md border border-accent-soft px-3 py-2 text-base mt-1"
              />
            </label>
          ))}
        </div>
      )}
    </>
  );
}
