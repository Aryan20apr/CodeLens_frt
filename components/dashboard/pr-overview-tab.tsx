"use client";

import { useMemo } from "react";
import {
  Sparkles,
  ShieldAlert,
  Zap,
  FlaskConical,
  AlertTriangle,
  Lightbulb,
  Bug,
  Clock,
  GitCommit,
  ArrowRight,
  FileCode2,
} from "lucide-react";
import type { ReviewRun } from "@/lib/review-runs/review-run-types";
import type { GithubPullRequestFile } from "@/lib/github/types";
import { FormattedAiSummary } from "@/components/dashboard/formatted-ai-summary";

interface PrOverviewTabProps {
  latestRun: ReviewRun | null;
  files: GithubPullRequestFile[];
  isLoadingRun: boolean;
  onSelectFile?: (filename: string) => void;
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
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="rgba(70,69,84,0.3)"
          strokeWidth="8"
        />
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
          style={{ filter: "drop-shadow(0 0 10px rgba(192,193,255,0.45))" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-3xl font-bold leading-none"
          style={{ color: "var(--on-surface)", fontFamily: "var(--font-geist-sans)" }}
        >
          {score}
        </span>
        <span
          className="mt-1 text-xs"
          style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}
        >
          /100
        </span>
      </div>
    </div>
  );
}

export function PrOverviewTab({
  latestRun,
  files,
  isLoadingRun,
  onSelectFile,
}: PrOverviewTabProps) {
  const summaryText = latestRun?.summaryText ?? null;
  const duration = latestRun
    ? formatDuration(latestRun.createdAt, latestRun.completedAt)
    : "—";
  const headShaShort = latestRun?.headSha?.slice(0, 7) ?? "—";

  // Derive findings breakdown from summary text if present
  const metrics = useMemo(() => {
    if (!summaryText) {
      return { security: 0, suggestions: 0, bugs: 0, score: 0 };
    }
    const lower = summaryText.toLowerCase();
    const hasVuln =
      lower.includes("vulnerability") ||
      lower.includes("injection") ||
      lower.includes("security");
    const hasPerf =
      lower.includes("performance") ||
      lower.includes("inefficient") ||
      lower.includes("leak");
    const hasBug = lower.includes("bug") || lower.includes("error") || lower.includes("crash");

    const security = hasVuln ? 1 : 0;
    const suggestions = hasPerf ? 2 : 1;
    const bugs = hasBug ? 1 : 0;
    const score = Math.max(50, 100 - security * 15 - suggestions * 5 - bugs * 20);

    return { security, suggestions, bugs, score };
  }, [summaryText]);

  // Extract dynamic categories for walkthrough
  const walkthroughItems = useMemo(() => {
    if (!summaryText) {
      return [
        {
          icon: ShieldAlert,
          label: "Security & Authentication",
          iconColor: "var(--tertiary)",
          summary:
            "Evaluates authentication flows, secret storage, SQL sanitization, and session handling.",
        },
        {
          icon: Zap,
          label: "Performance & Caching",
          iconColor: "var(--primary)",
          summary:
            "Identifies inefficient loops, unnecessary re-renders, memory leaks, and query bottlenecks.",
        },
        {
          icon: FlaskConical,
          label: "Test Coverage & Reliability",
          iconColor: "#4ade80",
          summary:
            "Verifies test suite additions, edge cases, error handling, and regression safety.",
        },
      ];
    }

    const items: {
      icon: typeof ShieldAlert;
      label: string;
      iconColor: string;
      summary: string;
    }[] = [];

    if (summaryText.toLowerCase().includes("security")) {
      items.push({
        icon: ShieldAlert,
        label: "Security Audit & Vulnerabilities",
        iconColor: "var(--tertiary)",
        summary:
          "Identified security findings regarding input sanitization and secure query handling.",
      });
    }
    if (summaryText.toLowerCase().includes("performance")) {
      items.push({
        icon: Zap,
        label: "Performance Optimization & Resource Usage",
        iconColor: "var(--primary)",
        summary:
          "Highlights potential bottlenecks in iteration, memory allocations, and database queries.",
      });
    }
    if (summaryText.toLowerCase().includes("best practice")) {
      items.push({
        icon: Sparkles,
        label: "Best Practices & Code Maintainability",
        iconColor: "#38bdf8",
        summary:
          "Checks adherence to clean architecture, consistent naming, and framework patterns.",
      });
    }
    if (items.length === 0) {
      items.push({
        icon: FlaskConical,
        label: "Code Quality Assessment",
        iconColor: "#4ade80",
        summary: "Automated analysis of changed code and overall pull request health.",
      });
    }
    return items;
  }, [summaryText]);

  return (
    <div className="mx-auto max-w-7xl pb-12">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column — main content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Executive Summary */}
          <div
            className="ghost-border relative overflow-hidden rounded-xl p-6"
            style={{ background: "var(--surface-low)" }}
          >
            {/* Left accent indicator */}
            <div
              className="absolute inset-y-0 left-0 w-1 rounded-l-xl"
              style={{ background: "var(--primary)" }}
            />
            <div className="flex items-start gap-4 pl-2">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                style={{ background: "rgba(192,193,255,0.12)" }}
              >
                <Sparkles className="h-5 w-5" style={{ color: "var(--primary)" }} aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <h2
                  className="mb-3 text-base font-semibold"
                  style={{ color: "var(--on-surface)", fontFamily: "var(--font-geist-sans)" }}
                >
                  AI Executive Summary
                </h2>
                {isLoadingRun ? (
                  <div className="space-y-2.5">
                    <div
                      className="h-4 w-full animate-pulse rounded"
                      style={{ background: "var(--surface-high)" }}
                    />
                    <div
                      className="h-4 w-5/6 animate-pulse rounded"
                      style={{ background: "var(--surface-high)" }}
                    />
                    <div
                      className="h-4 w-3/4 animate-pulse rounded"
                      style={{ background: "var(--surface-high)" }}
                    />
                  </div>
                ) : summaryText ? (
                  <FormattedAiSummary text={summaryText} />
                ) : (
                  <p
                    className="text-sm"
                    style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-inter)" }}
                  >
                    {latestRun?.status === "FAILED"
                      ? "AI review failed. Re-run the review to generate a summary."
                      : latestRun?.status === "RUNNING" || latestRun?.status === "PENDING"
                      ? "AI review is currently analyzing this pull request…"
                      : "No AI summary yet. Click 'Run Review' to generate instant insights."}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* AI Walkthrough Accordions */}
          <div className="space-y-3">
            <h3
              className="ml-1 text-xs font-semibold uppercase tracking-wider"
              style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}
            >
              AI Walkthrough
            </h3>
            {walkthroughItems.map(({ icon: Icon, label, iconColor, summary }, idx) => (
              <details
                key={label}
                open={idx === 0}
                className="ghost-border group overflow-hidden rounded-xl transition-all"
                style={{ background: "var(--surface-low)" }}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 transition-colors hover:bg-[var(--surface-container)]">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
                      style={{ background: "rgba(53,52,55,0.7)" }}
                    >
                      <Icon className="h-4 w-4" style={{ color: iconColor }} aria-hidden />
                    </div>
                    <span
                      className="text-sm font-semibold"
                      style={{ color: "var(--on-surface)", fontFamily: "var(--font-geist-sans)" }}
                    >
                      {label}
                    </span>
                  </div>
                  <span
                    className="text-xs font-bold transition-transform duration-200 group-open:rotate-180"
                    style={{ color: "var(--on-surface-variant)" }}
                  >
                    ▾
                  </span>
                </summary>
                <div
                  className="border-t px-5 pb-5 pt-3"
                  style={{ borderColor: "rgba(70,69,84,0.15)" }}
                >
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-inter)" }}
                  >
                    {summary}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Right column — widgets */}
        <div className="space-y-6">
          {/* PR Health Scorecard */}
          <div
            className="ghost-border rounded-xl p-6"
            style={{ background: "var(--surface-low)" }}
          >
            <h3
              className="mb-6 text-xs font-semibold uppercase tracking-wider"
              style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}
            >
              PR Health Score
            </h3>
            <div className="mb-6 flex justify-center">
              <ScoreGauge score={latestRun?.status === "COMPLETED" ? metrics.score : 0} />
            </div>
            <div className="space-y-2">
              {[
                {
                  icon: AlertTriangle,
                  label: "Security Warnings",
                  count: metrics.security,
                  color: "var(--tertiary)",
                },
                {
                  icon: Lightbulb,
                  label: "Suggestions",
                  count: metrics.suggestions,
                  color: "var(--primary)",
                },
                {
                  icon: Bug,
                  label: "Critical Bugs",
                  count: metrics.bugs,
                  color: metrics.bugs > 0 ? "var(--error)" : "#4ade80",
                },
              ].map(({ icon: Icon, label, count, color }) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-lg p-2.5"
                  style={{ background: "rgba(53,52,55,0.5)" }}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 shrink-0" style={{ color }} aria-hidden />
                    <span
                      className="text-sm"
                      style={{ color: "var(--on-surface)", fontFamily: "var(--font-inter)" }}
                    >
                      {label}
                    </span>
                  </div>
                  <span
                    className="text-sm font-bold"
                    style={{ color, fontFamily: "var(--font-space-grotesk)" }}
                  >
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Impacted Files List */}
          <div
            className="ghost-border rounded-xl p-6"
            style={{ background: "var(--surface-low)" }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}
              >
                Impacted Files
              </h3>
              <span
                className="rounded px-2 py-0.5 text-xs font-semibold"
                style={{
                  background: "var(--surface-high)",
                  color: "var(--on-surface-variant)",
                  fontFamily: "var(--font-space-grotesk)",
                }}
              >
                {files.length} {files.length === 1 ? "file" : "files"}
              </span>
            </div>
            <div className="space-y-1">
              {files.slice(0, 6).map((file) => (
                <button
                  key={file.filename}
                  type="button"
                  onClick={() => onSelectFile?.(file.filename)}
                  className="group flex w-full items-center gap-2.5 rounded-lg p-2 text-left transition-colors hover:bg-[var(--surface-container)]"
                >
                  <FileCode2
                    className="h-4 w-4 shrink-0 text-[var(--on-surface-variant)] transition-colors group-hover:text-[var(--primary)]"
                    aria-hidden
                  />
                  <span
                    className="min-w-0 flex-1 truncate text-xs font-medium transition-colors group-hover:text-[var(--primary)]"
                    style={{ color: "var(--on-surface)", fontFamily: "var(--font-geist-mono)" }}
                  >
                    {file.filename}
                  </span>
                  <span
                    className="shrink-0 text-xs font-semibold"
                    style={{ fontFamily: "var(--font-space-grotesk)" }}
                  >
                    <span style={{ color: "#4ade80" }}>+{file.additions}</span>{" "}
                    <span style={{ color: "var(--error)" }}>−{file.deletions}</span>
                  </span>
                  <ArrowRight
                    className="h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                    style={{ color: "var(--primary)" }}
                    aria-hidden
                  />
                </button>
              ))}
              {files.length > 6 && (
                <button
                  type="button"
                  onClick={() => onSelectFile?.(files[6]?.filename ?? "")}
                  className="w-full pt-1 text-center text-xs font-medium transition-opacity hover:opacity-80"
                  style={{ color: "var(--primary)", fontFamily: "var(--font-space-grotesk)" }}
                >
                  +{files.length - 6} more files (view all diffs →)
                </button>
              )}
            </div>
          </div>

          {/* AI Model & Run Info Card */}
          {latestRun && (
            <div className="glass-panel ghost-border rounded-xl p-5">
              <div className="flex items-start gap-3.5">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: "rgba(192,193,255,0.12)" }}
                >
                  <Sparkles className="h-5 w-5" style={{ color: "var(--primary)" }} aria-hidden />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "var(--on-surface)", fontFamily: "var(--font-space-grotesk)" }}
                  >
                    AI Review Run
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5">
                    <span
                      className="flex items-center gap-1 text-xs"
                      style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}
                    >
                      <GitCommit className="h-3 w-3" aria-hidden />
                      {headShaShort}
                    </span>
                    <span
                      className="flex items-center gap-1 text-xs"
                      style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}
                    >
                      <Clock className="h-3 w-3" aria-hidden />
                      {duration}
                    </span>
                    <span
                      className="rounded px-2 py-0.5 text-xs font-bold capitalize"
                      style={{
                        background:
                          latestRun.status === "COMPLETED"
                            ? "rgba(74,222,128,0.15)"
                            : latestRun.status === "FAILED"
                            ? "rgba(255,180,171,0.15)"
                            : "rgba(192,193,255,0.15)",
                        color:
                          latestRun.status === "COMPLETED"
                            ? "#4ade80"
                            : latestRun.status === "FAILED"
                            ? "var(--error)"
                            : "var(--primary)",
                        fontFamily: "var(--font-space-grotesk)",
                      }}
                    >
                      {latestRun.status.toLowerCase()}
                    </span>
                  </div>
                  <p
                    className="pt-1 text-xs"
                    style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}
                  >
                    Triggered via {latestRun.triggeredBy === "WEBHOOK" ? "GitHub Push Webhook" : "Manual Dashboard Trigger"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
