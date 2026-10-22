"use client";

import { useFormStatus } from "react-dom";
import type { ButtonHTMLAttributes } from "react";

export function SubmitButton({
  children,
  pendingText = "Saving…",
  className,
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { pendingText?: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      aria-busy={pending}
      className={`${className ?? ""} transition hover:opacity-80 hover:-translate-y-0.5 active:scale-95 active:translate-y-0 active:opacity-100 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:active:scale-100 disabled:hover:opacity-60`}
      {...props}
    >
      {pending ? (
        <span className="inline-flex items-center justify-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
          {pendingText}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
