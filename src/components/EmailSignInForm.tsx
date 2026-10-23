"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function EmailSignInForm({ mode }: { mode: "signin" | "signup" }) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error" | "rate_limited">("idle");

  if (status === "sent") {
    return (
      <p className="text-sm text-foreground/70">
        Check your email for a {mode === "signup" ? "sign-up" : "sign-in"} link.
      </p>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setStatus("sending");
        const supabase = createClient();
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            // Only applied when this email creates a brand-new account —
            // ignored for a returning user, so it's safe to always send.
            data: mode === "signup" && fullName ? { full_name: fullName } : undefined,
          },
        });
        if (!error) {
          setStatus("sent");
        } else if (error.status === 429) {
          setStatus("rate_limited");
        } else {
          setStatus("error");
        }
      }}
      className="flex flex-col gap-2"
    >
      {mode === "signup" && (
        <input
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Full name"
          className="rounded-md border border-accent-soft px-3 py-2 text-sm"
        />
      )}
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="rounded-md border border-accent-soft px-3 py-2 text-sm"
      />
      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded-full border border-accent-soft px-6 py-2 text-sm transition hover:bg-accent-soft active:scale-95 disabled:opacity-60"
      >
        {status === "sending" ? (
          <span className="inline-flex items-center justify-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
            Sending…
          </span>
        ) : mode === "signup" ? (
          "Email me a sign-up link"
        ) : (
          "Email me a sign-in link"
        )}
      </button>
      {status === "error" && (
        <p className="text-sm text-red-700">Something went wrong. Try again.</p>
      )}
      {status === "rate_limited" && (
        <p className="text-sm text-red-700">
          Too many attempts — please wait a minute before trying again.
        </p>
      )}
    </form>
  );
}
