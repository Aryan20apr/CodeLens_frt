interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  trend?: string;
  trendUp?: boolean;
}

function StatCard({ label, value, sub, trend, trendUp }: StatCardProps) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-3"
      style={{ background: "var(--surface-container)", boxShadow: "var(--shadow-card)" }}
    >
      <span
        className="text-xs font-semibold uppercase tracking-wider"
        style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}
      >
        {label}
      </span>
      <div className="flex items-end justify-between">
        <span
          className="text-3xl font-bold tabular-nums"
          style={{ fontFamily: "var(--font-geist-sans)", color: "var(--on-surface)" }}
        >
          {value}
        </span>
        {trend && (
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{
              background: trendUp ? "rgba(99,102,241,0.12)" : "rgba(255,180,171,0.12)",
              color: trendUp ? "var(--primary)" : "var(--error)",
              fontFamily: "var(--font-space-grotesk)",
            }}
          >
            {trend}
          </span>
        )}
      </div>
      {sub && (
        <span className="text-xs" style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}>
          {sub}
        </span>
      )}
    </div>
  );
}

export function StatsCards() {
  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      <StatCard label="Total Evaluations" value="47" trend="+12%" trendUp />
      <StatCard label="Avg Score" value="84" sub="out of 100" />
      <StatCard label="Issues Found" value="213" sub="High: 42 · Low: 171" />
      <StatCard label="Active PRs" value="3" sub="Scanning..." />
    </div>
  );
}
