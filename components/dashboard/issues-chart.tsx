interface IssueBar {
  label: string;
  count: number;
  color: string;
  bg: string;
}

const ISSUE_BARS: IssueBar[] = [
  { label: "Security",      count: 45, color: "var(--error)",     bg: "rgba(255,180,171,0.12)" },
  { label: "Performance",   count: 89, color: "var(--tertiary)",  bg: "rgba(255,183,131,0.12)" },
  { label: "Best Practices",count: 79, color: "var(--primary)",   bg: "rgba(99,102,241,0.12)"  },
];

const MAX = Math.max(...ISSUE_BARS.map((b) => b.count));

export function IssuesChart() {
  return (
    <div
      className="rounded-2xl p-6 flex flex-col gap-5"
      style={{ background: "var(--surface-container)", boxShadow: "var(--shadow-card)" }}
    >
      <h2
        className="text-sm font-semibold"
        style={{ fontFamily: "var(--font-geist-sans)", color: "var(--on-surface)" }}
      >
        Top Issues This Week
      </h2>

      <div className="flex flex-col gap-4">
        {ISSUE_BARS.map(({ label, count, color, bg }) => (
          <div key={label} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span
                className="text-xs font-semibold"
                style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}
              >
                {label}
              </span>
              <span
                className="text-xs font-bold tabular-nums"
                style={{ color, fontFamily: "var(--font-space-grotesk)" }}
              >
                {count}
              </span>
            </div>
            {/* Bar track */}
            <div
              className="w-full h-2 rounded-full overflow-hidden"
              style={{ background: "var(--surface-highest)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${(count / MAX) * 100}%`,
                  background: color,
                  boxShadow: `0 0 8px ${bg}`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
