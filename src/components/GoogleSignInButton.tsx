"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { linkSignedInAccount } from "@/app/account/actions";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            nonce: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: string;
              size?: string;
              shape?: string;
              text?: string;
              width?: number;
            }
          ) => void;
        };
      };
    };
  }
}

// Random nonce, hashed before handing to Google (ties the ID token to this
// specific sign-in attempt); the raw value goes to Supabase, which hashes
// it itself to verify against the token's nonce claim.
async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function GoogleSignInButton({ mode = "signin" }: { mode?: "signin" | "signup" }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [scriptReady, setScriptReady] = useState(false);
  const [status, setStatus] = useState<"idle" | "signing-in" | "error">("idle");

  useEffect(() => {
    if (!scriptReady || !window.google || !containerRef.current) return;
    let cancelled = false;
    containerRef.current.innerHTML = "";

    (async () => {
      const rawNonce = crypto.randomUUID() + crypto.randomUUID();
      const hashedNonce = await sha256Hex(rawNonce);
      if (cancelled || !containerRef.current) return;

      window.google!.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        nonce: hashedNonce,
        callback: async (response) => {
          setStatus("signing-in");
          const supabase = createClient();
          const { error } = await supabase.auth.signInWithIdToken({
            provider: "google",
            token: response.credential,
            nonce: rawNonce,
          });
          if (error) {
            console.error("Google sign-in failed:", error);
            setStatus("error");
            return;
          }
          await linkSignedInAccount();
          router.push("/account");
          router.refresh();
        },
      });

      window.google!.accounts.id.renderButton(containerRef.current, {
        theme: "outline",
        size: "large",
        shape: "pill",
        text: mode === "signup" ? "signup_with" : "signin_with",
        width: 280,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [scriptReady, router, mode]);

  return (
    <div className="flex flex-col items-center gap-2">
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
      />
      <div ref={containerRef} />
      {status === "signing-in" && (
        <p className="text-sm text-foreground/70">
          {mode === "signup" ? "Creating your account…" : "Signing in…"}
        </p>
      )}
      {status === "error" && (
        <p className="text-sm text-red-700">Something went wrong. Try again.</p>
      )}
    </div>
  );
}
