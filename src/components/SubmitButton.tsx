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
      className={`${className ?? ""} transition active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100`}
      {...props}
    >
      {pending ? pendingText : children}
    </button>
  );
}
