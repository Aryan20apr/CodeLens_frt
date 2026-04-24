const STATS = [
  { value: "1,200+", label: "Evaluations Run" },
  { value: "95%", label: "Accuracy Rate" },
  { value: "6", label: "Analysis Categories" },
];

export function StatsBar() {
  return (
    <section className="py-12 border-y border-white/5" style={{ background: "var(--surface)" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-white/5">
          {STATS.map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center justify-center p-4">
              <span
                className="text-4xl font-bold text-primary mb-2 tabular-nums"
                style={{ fontFamily: "var(--font-geist-sans)" }}
              >
                {value}
              </span>
              <span
                className="text-sm uppercase tracking-widest text-[#d1d5db]"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
