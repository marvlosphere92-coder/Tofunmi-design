export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-accent-soft border-t-accent animate-spin" />
        <p className="font-serif text-lg text-foreground/70">SimplyBukky</p>
      </div>
    </div>
  );
}
