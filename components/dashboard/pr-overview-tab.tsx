"use client";

import { Sparkles, ShieldAlert, Zap, FlaskConical, AlertTriangle, Lightbulb, Bug, Clock, GitCommit } from "lucide-react";
import type { ReviewRun } from "@/lib/review-runs/review-run-types";
import type { GithubPullRequestFile } from "@/lib/github/types";

interface PrOverviewTabProps {
  latestRun: ReviewRun | null;
  files: GithubPullRequestFile[];
  isLoadingRun: boolean;
}

function formatDuration(createdAt: string, completedAt: string | null): string {
  if (!completedAt) return "—";
  const ms = new Date(completedAt).getTime() - new Date(createdAt).getTime();
  if (ms < 0) return "—";
  const s = Math.round(ms / 1000);
  return s < 60 ? `${s}s` : `${Math.round(s / 60)}m`;
}

function ScoreGauge({ score }: { score: number }) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="relative flex h-32 w-32 items-center justify-center">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(70,69,84,0.3)" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ filter: "drop-shadow(0 0 8px rgba(192,193,255,0.4))" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold leading-none" style={{ color: "var(--on-surface)", fontFamily: "var(--font-geist-sans)" }}>
          {score}
        </span>
        <span className="mt-1 text-xs" style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}>
          /100
        </span>
      </div>
    </div>
  );
}

const WALKTHROUGH_SECTIONS = [
  {
    icon: ShieldAlert,
    label: "Security & Authentication",
    iconColor: "var(--tertiary)",
    summary: "Review authentication flow changes including HttpOnly cookie rotation, CSRF protection, and secure session management.",
  },
  {
    icon: Zap,
    label: "Performance & Caching",
    iconColor: "var(--primary)",
    summary: "Evaluate caching strategy changes and Redis sliding window rate limiter implementation.",
  },
  {
    icon: FlaskConical,
    label: "Test Coverage",
    iconColor: "#4ade80",
    summary: "New test suites covering token expiration, refresh rotation, and rate limit boundary conditions.",
  },
];

export function PrOverviewTab({ latestRun, files, isLoadingRun }: PrOverviewTabProps) {
  const summaryText = latestRun?.summaryText ?? null;
  const duration = latestRun ? formatDuration(latestRun.createdAt, latestRun.completedAt) : "—";
  const headShaShort = latestRun?.headSha?.slice(0, 7) ?? "—";

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Left column */}
      <div className="space-y-6 lg:col-span-2">
        {/* Executive Summary */}
        <div className="ghost-border relative overflow-hidden rounded-xl p-6" style={{ background: "var(--surface-low)" }}>
          <div className="absolute inset-y-0 left-0 w-1 rounded-l-xl" style={{ background: "var(--primary)" }} />
          <div className="flex items-start gap-4 pl-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ background: "rgba(192,193,255,0.1)" }}>
              <Sparkles className="h-5 w-5" style={{ color: "var(--primary)" }} aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="mb-2 font-semibold" style={{ color: "var(--on-surface)", fontFamily: "var(--font-geist-sans)" }}>
                AI Executive Summary
              </h2>
              {isLoadingRun ? (
                <div className="space-y-2">
                  <div className="h-3.5 w-full animate-pulse rounded" style={{ background: "var(--surface-high)" }} />
                  <div className="h-3.5 w-4/5 animate-pulse rounded" style={{ background: "var(--surface-high)" }} />
                </div>
              ) : summaryText ? (
                <p className="text-sm leading-relaxed" style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-inter)" }}>
                  {summaryText}
                </p>
              ) : (
                <p className="text-sm" style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-inter)" }}>
                  {latestRun?.status === "FAILED"
                    ? "AI review failed. Re-run the review to generate a summary."
                    : latestRun?.status === "RUNNING" || latestRun?.status === "PENDING"
                    ? "AI review is in progress…"
                    : "No AI summary yet. Run a review to generate insights."}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Walkthrough Accordions */}
        <div className="space-y-3">
          <p className="ml-1 text-xs uppercase tracking-wider" style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}>
            AI Walkthrough
          </p>
          {WALKTHROUGH_SECTIONS.map(({ icon: Icon, label, iconColor, summary }) => (
            <details key={label} className="ghost-border group overflow-hidden rounded-lg" style={{ background: "var(--surface-low)" }}>
              <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 transition-colors hover:bg-[var(--surface-high)]">
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 shrink-0" style={{ color: iconColor }} aria-hidden />
                  <span className="text-sm font-medium" style={{ color: "var(--on-surface)", fontFamily: "var(--font-geist-sans)" }}>
                    {label}
                  </span>
                </div>
                <span className="text-xs transition-transform duration-200 group-open:rotate-180" style={{ color: "var(--on-surface-variant)" }}>▾</span>
              </summary>
              <div className="px-5 pb-5 pt-1">
                <p className="text-sm leading-relaxed" style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-inter)" }}>
                  {summary}
                </p>
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* Right column — widgets */}
      <div className="space-y-5">
        {/* Health Scorecard */}
        <div className="ghost-border rounded-xl p-5" style={{ background: "var(--surface-low)" }}>
          <p className="mb-5 text-xs uppercase tracking-wider" style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}>
            PR Health Score
          </p>
          <div className="mb-5 flex justify-center">
            <ScoreGauge score={latestRun?.status === "COMPLETED" ? 88 : 0} />
          </div>
          <div className="space-y-1.5">
            {[
              { icon: AlertTriangle, label: "Security Warnings", count: 1, color: "var(--tertiary)" },
              { icon: Lightbulb, label: "Suggestions", count: 2, color: "var(--primary)" },
              { icon: Bug, label: "Critical Bugs", count: 0, color: "#4ade80" },
            ].map(({ icon: Icon, label, count, color }) => (
              <div key={label} className="flex items-center justify-between rounded-md p-2" style={{ background: "rgba(53,52,55,0.5)" }}>
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 shrink-0" style={{ color }} aria-hidden />
                  <span className="text-sm" style={{ color: "var(--on-surface)", fontFamily: "var(--font-inter)" }}>{label}</span>
                </div>
                <span className="text-sm font-bold" style={{ color, fontFamily: "var(--font-space-grotesk)" }}>{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Impacted Files */}
        <div className="ghost-border rounded-xl p-5" style={{ background: "var(--surface-low)" }}>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider" style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}>
              Impacted Files
            </p>
            <span className="rounded px-2 py-0.5 text-xs" style={{ background: "var(--surface-high)", color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}>
              {files.length} files
            </span>
          </div>
          <div className="space-y-1">
            {files.slice(0, 5).map((file) => (
              <div key={file.filename} className="flex items-center gap-2 rounded-lg px-2 py-1.5">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: file.additions > file.deletions ? "var(--primary)" : "var(--tertiary)" }} />
                <span className="min-w-0 flex-1 truncate text-xs" style={{ color: "var(--on-surface)", fontFamily: "var(--font-geist-mono)" }}>{file.filename}</span>
                <span className="shrink-0 text-xs" style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}>
                  +{file.additions} -{file.deletions}
                </span>
              </div>
            ))}
            {files.length > 5 && (
              <p className="px-2 text-xs" style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}>
                +{files.length - 5} more files
              </p>
            )}
          </div>
        </div>

        {/* Run Info Card */}
        {latestRun && (
          <div className="glass-panel ghost-border rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0" style={{ color: "var(--primary)" }} aria-hidden />
              <div className="space-y-1">
                <p className="text-sm font-medium" style={{ color: "var(--on-surface)", fontFamily: "var(--font-space-grotesk)" }}>
                  AI Review Run
                </p>
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  <span className="flex items-center gap-1 text-xs" style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}>
                    <GitCommit className="h-3 w-3" aria-hidden />{headShaShort}
                  </span>
                  <span className="flex items-center gap-1 text-xs" style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}>
                    <Clock className="h-3 w-3" aria-hidden />{duration}
                  </span>
                  <span
                    className="rounded px-1.5 py-0.5 text-xs font-semibold capitalize"
                    style={{
                      background: latestRun.status === "COMPLETED" ? "rgba(74,222,128,0.15)" : latestRun.status === "FAILED" ? "rgba(255,180,171,0.15)" : "rgba(192,193,255,0.15)",
                      color: latestRun.status === "COMPLETED" ? "#4ade80" : latestRun.status === "FAILED" ? "var(--error)" : "var(--primary)",
                      fontFamily: "var(--font-space-grotesk)",
                    }}
                  >
                    {latestRun.status.toLowerCase()}
                  </span>
                </div>
                <p className="text-xs" style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}>
                  via {latestRun.triggeredBy === "WEBHOOK" ? "Auto (push webhook)" : "Manual trigger"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
