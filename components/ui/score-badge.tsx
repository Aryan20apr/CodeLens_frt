interface ScoreBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showBloom?: boolean;
}

export function ScoreBadge({ score, size = "md", showBloom = false }: ScoreBadgeProps) {
  const cfg = {
    sm: { wh: "w-14 h-14", text: "text-lg",  r: 22, sw: 3 },
    md: { wh: "w-20 h-20", text: "text-2xl", r: 32, sw: 4 },
    lg: { wh: "w-28 h-28", text: "text-4xl", r: 46, sw: 5 },
  }[size];

  const circ  = 2 * Math.PI * cfg.r;
  const dash  = (score / 100) * circ;
  const color = score >= 80 ? "var(--primary)" : score >= 60 ? "var(--tertiary)" : "var(--error)";
  const dim   = (cfg.r + cfg.sw) * 2;

  return (
    <div className={`relative flex items-center justify-center ${cfg.wh}`}>
      {showBloom && (
        <span className="absolute inset-0 rounded-full indigo-bloom pointer-events-none" />
      )}
      <svg
        className="absolute inset-0 -rotate-90"
        viewBox={`0 0 ${dim} ${dim}`}
        fill="none"
        aria-hidden
      >
        <circle
          cx={cfg.r + cfg.sw} cy={cfg.r + cfg.sw} r={cfg.r}
          stroke="var(--surface-highest)" strokeWidth={cfg.sw}
        />
        <circle
          cx={cfg.r + cfg.sw} cy={cfg.r + cfg.sw} r={cfg.r}
          stroke={color} strokeWidth={cfg.sw}
          strokeDasharray={circ}
          strokeDashoffset={circ - dash}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <span
        className={`relative tabular-nums font-bold ${cfg.text}`}
        style={{ color, fontFamily: "var(--font-geist-sans)" }}
      >
        {score}
      </span>
    </div>
  );
}
