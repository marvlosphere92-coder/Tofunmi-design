"use client";

import { SubmitButton } from "@/components/SubmitButton";

export function ConfirmDeleteForm({
  action,
  hiddenFields,
  confirmMessage,
  label = "Delete",
  className = "text-sm underline text-red-700 transition hover:opacity-70",
}: {
  action: (formData: FormData) => void;
  hiddenFields: Record<string, string>;
  confirmMessage: string;
  label?: string;
  className?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(confirmMessage)) {
          e.preventDefault();
        }
      }}
    >
      {Object.entries(hiddenFields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <SubmitButton className={className} pendingText="Deleting…">
        {label}
      </SubmitButton>
    </form>
  );
}
