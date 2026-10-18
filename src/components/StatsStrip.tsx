import { FadeIn } from "@/components/FadeIn";

const stats = [
  { value: "100%", label: "Hand-sewn, start to finish" },
  { value: "2–3 wks", label: "Typical turnaround" },
  { value: "Limited", label: "Orders taken per month" },
];

export function StatsStrip() {
  return (
    <FadeIn>
      <section className="border-y border-accent-soft">
        <div className="mx-auto max-w-6xl px-6 py-10 grid grid-cols-3 gap-4 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="font-serif text-2xl md:text-3xl">{s.value}</p>
              <p className="text-xs md:text-sm text-foreground/60 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>
    </FadeIn>
  );
}
