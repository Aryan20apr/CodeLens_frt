import type { Metadata } from "next";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { CodeEditor } from "@/components/dashboard/code-editor";
import { EvaluationsTable } from "@/components/dashboard/evaluations-table";
import { IssuesChart } from "@/components/dashboard/issues-chart";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8 pb-8">
      {/* Stat cards row */}
      <StatsCards />

      {/* Main content: editor + chart side by side */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Code editor — 2/3 width */}
        <div className="xl:col-span-2 flex flex-col gap-2">
          <h2
            className="text-sm font-semibold px-1"
            style={{ fontFamily: "var(--font-geist-sans)", color: "var(--on-surface)" }}
          >
            Start a New Evaluation
          </h2>
          <CodeEditor />
        </div>

        {/* Issues chart — 1/3 width */}
        <IssuesChart />
      </div>

      {/* Recent evaluations full width */}
      <EvaluationsTable />
    </div>
  );
}
