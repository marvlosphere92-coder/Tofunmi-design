export function Avatar({ name, className }: { name: string; className?: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-accent text-white font-medium ${className ?? "w-10 h-10 text-sm"}`}
    >
      {initial}
    </span>
  );
}
