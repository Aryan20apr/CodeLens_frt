type Status = "pass" | "fail" | "warn";

const CONFIG: Record<Status, { label: string; bg: string; color: string }> = {
  pass: { label: "Pass", bg: "rgba(99,102,241,0.14)",  color: "var(--primary)"  },
  warn: { label: "Warn", bg: "rgba(255,183,131,0.14)", color: "var(--tertiary)" },
  fail: { label: "Fail", bg: "rgba(255,180,171,0.14)", color: "var(--error)"    },
};

export function StatusChip({ status }: { status: Status }) {
  const { label, bg, color } = CONFIG[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: bg, color, fontFamily: "var(--font-space-grotesk)" }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
