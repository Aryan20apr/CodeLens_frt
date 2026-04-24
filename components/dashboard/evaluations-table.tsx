import { StatusChip } from "@/components/ui/status-chip";

interface Evaluation {
  file: string;
  lang: string;
  score: number;
  status: "pass" | "warn" | "fail";
  issues: number;
}

const EVALUATIONS: Evaluation[] = [
  { file: "auth.service.ts", lang: "TS",  score: 92, status: "pass", issues: 2  },
  { file: "api-handler.py",  lang: "PY",  score: 64, status: "fail", issues: 18 },
  { file: "utils.ts",        lang: "TS",  score: 88, status: "pass", issues: 5  },
  { file: "database.go",     lang: "GO",  score: 75, status: "warn", issues: 12 },
  { file: "config.js",       lang: "JS",  score: 98, status: "pass", issues: 0  },
];

export function EvaluationsTable() {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "var(--surface-container)", boxShadow: "var(--shadow-card)" }}
    >
      <div className="px-6 py-4" style={{ borderBottom: "1px solid rgba(70,69,84,0.15)" }}>
        <h2
          className="text-sm font-semibold"
          style={{ fontFamily: "var(--font-geist-sans)", color: "var(--on-surface)" }}
        >
          Recent Evaluations
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(70,69,84,0.12)" }}>
              {["File Name", "Language", "Score", "Status", "Issues"].map((col) => (
                <th
                  key={col}
                  className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {EVALUATIONS.map(({ file, lang, score, status, issues }) => {
              const scoreColor =
                score >= 80 ? "var(--primary)" : score >= 60 ? "var(--tertiary)" : "var(--error)";
              return (
                <tr
                  key={file}
                  className="transition-colors"
                  style={{ borderBottom: "1px solid rgba(70,69,84,0.08)" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.background = "var(--surface-high)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.background = "transparent";
                  }}
                >
                  <td className="px-6 py-3.5">
                    <span
                      className="text-sm font-medium"
                      style={{ color: "var(--on-surface)", fontFamily: "var(--font-geist-mono)" }}
                    >
                      {file}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span
                      className="text-xs px-2 py-0.5 rounded-md font-semibold"
                      style={{
                        background: "var(--surface-highest)",
                        color: "var(--on-surface-variant)",
                        fontFamily: "var(--font-space-grotesk)",
                      }}
                    >
                      {lang}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span
                      className="text-sm font-bold tabular-nums"
                      style={{ color: scoreColor, fontFamily: "var(--font-geist-sans)" }}
                    >
                      {score}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <StatusChip status={status} />
                  </td>
                  <td className="px-6 py-3.5">
                    <span
                      className="text-sm tabular-nums"
                      style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}
                    >
                      {issues}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
