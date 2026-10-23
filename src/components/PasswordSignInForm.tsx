"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { linkSignedInAccount } from "@/app/account/actions";

export function PasswordSignInForm({ mode }: { mode: "signin" | "signup" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "check_email" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  if (status === "check_email") {
    return (
      <p className="text-sm text-foreground/70">
        Almost there — check your email to confirm your account, then sign in.
      </p>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setStatus("sending");
        setErrorMessage("");
        const supabase = createClient();

        if (mode === "signup") {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback`,
              data: { full_name: fullName },
            },
          });
          if (error) {
            setErrorMessage(error.message);
            setStatus("error");
            return;
          }
          if (!data.session) {
            // Email confirmation is required before this account can sign in.
            setStatus("check_email");
            return;
          }
        } else {
          const { error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) {
            setErrorMessage(error.message === "Invalid login credentials" ? "Wrong email or password." : error.message);
            setStatus("error");
            return;
          }
        }

        await linkSignedInAccount();
        router.push("/account");
        router.refresh();
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
          autoComplete="name"
          className="rounded-md border border-accent-soft px-3 py-2 text-sm"
        />
      )}
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        autoComplete="email"
        className="rounded-md border border-accent-soft px-3 py-2 text-sm"
      />
      <input
        type="password"
        required
        minLength={8}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder={mode === "signup" ? "Password (min. 8 characters)" : "Password"}
        autoComplete={mode === "signup" ? "new-password" : "current-password"}
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
            {mode === "signup" ? "Creating account…" : "Signing in…"}
          </span>
        ) : mode === "signup" ? (
          "Create account"
        ) : (
          "Sign in"
        )}
      </button>
      {status === "error" && <p className="text-sm text-red-700">{errorMessage}</p>}
    </form>
  );
}
