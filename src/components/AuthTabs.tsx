"use client";

import { useState } from "react";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { EmailSignInForm } from "@/components/EmailSignInForm";

export function AuthTabs() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  return (
    <div>
      <div className="inline-flex rounded-full border border-accent-soft p-1 text-sm">
        <button
          type="button"
          onClick={() => setMode("signin")}
          className={`rounded-full px-5 py-1.5 transition ${
            mode === "signin" ? "bg-accent text-white" : "text-foreground/60 hover:text-foreground"
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`rounded-full px-5 py-1.5 transition ${
            mode === "signup" ? "bg-accent text-white" : "text-foreground/60 hover:text-foreground"
          }`}
        >
          Create account
        </button>
      </div>

      <p className="mt-6 text-sm text-foreground/60">
        {mode === "signin"
          ? "Already ordered with us before? Sign in to see your order history."
          : "First time here? Create an account to track orders and leave reviews."}
      </p>

      <div className="mt-6 flex justify-center">
        <GoogleSignInButton />
      </div>
      <div className="mt-6 max-w-xs mx-auto">
        <p className="text-xs uppercase tracking-wide text-foreground/50 mb-3">Or, without Google</p>
        <EmailSignInForm mode={mode} />
      </div>
    </div>
  );
}
