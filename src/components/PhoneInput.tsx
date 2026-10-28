"use client";

// Strips anything that isn't a digit, +, space, dash or parenthesis as the
// customer types or pastes — keeps the field free-form enough for real
// phone number formatting while blocking letters/symbols.
function sanitize(e: React.ChangeEvent<HTMLInputElement>) {
  const cleaned = e.target.value.replace(/[^0-9+\s()-]/g, "");
  if (cleaned !== e.target.value) e.target.value = cleaned;
}

export function PhoneInput({
  id,
  name,
  required,
  defaultValue,
  placeholder,
  className,
  autoComplete = "tel",
}: {
  id?: string;
  name: string;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
  autoComplete?: string;
}) {
  return (
    <input
      id={id}
      name={name}
      type="tel"
      inputMode="tel"
      required={required}
      defaultValue={defaultValue}
      placeholder={placeholder}
      autoComplete={autoComplete}
      pattern="[0-9+\s()-]*"
      title="Phone numbers only"
      onChange={sanitize}
      className={className}
    />
  );
}
