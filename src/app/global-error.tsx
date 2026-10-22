"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled root error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ fontFamily: "sans-serif" }}>
        <main
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "2rem",
          }}
        >
          <div>
            <h1 style={{ fontSize: "1.5rem" }}>Something went wrong</h1>
            <p style={{ marginTop: "0.75rem", color: "#666" }}>
              Please refresh the page, or try again shortly.
            </p>
            <button
              onClick={() => reset()}
              style={{
                marginTop: "1.5rem",
                borderRadius: "999px",
                background: "#c98a94",
                color: "white",
                padding: "0.75rem 1.5rem",
                border: "none",
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
