import { FadeIn } from "@/components/FadeIn";

const stats = [
  { value: "100%", label: "Hand-sewn, start to finish" },
  { value: "2–3 wks", label: "Typical turnaround" },
  { value: "Small batch", label: "Orders accepted monthly — book early" },
];

export function StatsStrip() {
  return (
    <FadeIn>
      <section className="bg-plum text-white">
        <div className="mx-auto max-w-6xl px-6 py-10 grid grid-cols-3 gap-4 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="font-serif text-2xl md:text-3xl text-gold-soft">{s.value}</p>
              <p className="text-xs md:text-sm text-white/70 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>
    </FadeIn>
  );
}
