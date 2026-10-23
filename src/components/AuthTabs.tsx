"use client";

import { useState } from "react";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { EmailSignInForm } from "@/components/EmailSignInForm";
import { PasswordSignInForm } from "@/components/PasswordSignInForm";

export function AuthTabs() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [method, setMethod] = useState<"link" | "password">("link");

  return (
    <div>
      <div className="inline-flex rounded-full border border-accent-soft p-1 text-sm">
        <button
          type="button"
          onClick={() => setMode("signin")}
          className={`rounded-full px-5 py-1.5 transition ${
            mode === "signin" ? "bg-accent text-white" : "text-foreground/70 hover:text-foreground"
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`rounded-full px-5 py-1.5 transition ${
            mode === "signup" ? "bg-accent text-white" : "text-foreground/70 hover:text-foreground"
          }`}
        >
          Create account
        </button>
      </div>

      <p className="mt-6 text-sm text-foreground/70">
        {mode === "signin"
          ? "Already ordered with us before? Sign in to see your order history."
          : "First time here? Create an account to track orders and leave reviews."}
      </p>

      <div className="mt-6 flex justify-center">
        <GoogleSignInButton mode={mode} />
      </div>

      <div className="mt-6 max-w-xs mx-auto">
        <p className="text-xs uppercase tracking-wide text-foreground/70 mb-3">Or, without Google</p>

        <div className="inline-flex rounded-full border border-accent-soft p-1 text-xs mb-4">
          <button
            type="button"
            onClick={() => setMethod("link")}
            className={`rounded-full px-3 py-1 transition ${
              method === "link" ? "bg-accent-soft text-foreground" : "text-foreground/60 hover:text-foreground"
            }`}
          >
            Email link
          </button>
          <button
            type="button"
            onClick={() => setMethod("password")}
            className={`rounded-full px-3 py-1 transition ${
              method === "password" ? "bg-accent-soft text-foreground" : "text-foreground/60 hover:text-foreground"
            }`}
          >
            Password
          </button>
        </div>

        {method === "link" ? <EmailSignInForm mode={mode} /> : <PasswordSignInForm mode={mode} />}
      </div>
    </div>
  );
}
