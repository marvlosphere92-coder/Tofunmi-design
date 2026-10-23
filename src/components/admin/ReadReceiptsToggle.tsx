"use client";

import { useRef, useTransition } from "react";

export function ReadReceiptsToggle({
  enabled,
  action,
}: {
  enabled: boolean;
  action: (formData: FormData) => Promise<void>;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      ref={formRef}
      action={action}
      className="flex items-center gap-2 text-sm text-foreground/70"
    >
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          name="enabled"
          defaultChecked={enabled}
          disabled={pending}
          onChange={() => startTransition(() => formRef.current?.requestSubmit())}
          className="w-4 h-4 accent-accent"
        />
        Show read receipts (so you can see when a customer has seen your message)
      </label>
      {pending && <span className="text-xs text-foreground/50">Saving…</span>}
    </form>
  );
}
