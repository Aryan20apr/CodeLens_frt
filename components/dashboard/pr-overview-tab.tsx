"use client";

import { useMemo, useState } from "react";
import {
  Sparkles,
  AlertTriangle,
  Lightbulb,
  Bug,
  Clock,
  GitCommit,
  ArrowRight,
  FileCode2,
  GitMerge,
  Search,
  ExternalLink,
  Flame,
  FilePlus2,
  FileMinus2,
  FilePenLine,
  TrendingUp,
  SlidersHorizontal,
} from "lucide-react";
import type { ReviewRun } from "@/lib/review-runs/review-run-types";
import type { GithubPullRequestFile } from "@/lib/github/types";
import { FormattedAiSummary } from "@/components/dashboard/formatted-ai-summary";

interface PrOverviewTabProps {
  latestRun: ReviewRun | null;
  files: GithubPullRequestFile[];
  isLoadingRun: boolean;
  onSelectFile?: (filename: string) => void;
  onViewAllDiffs?: () => void;
  onTriggerReview?: () => void;
  isStreaming?: boolean;
  htmlUrl?: string;
}

function formatDuration(createdAt: string, completedAt: string | null): string {
  if (!completedAt) return "—";
  const ms = new Date(completedAt).getTime() - new Date(createdAt).getTime();
  if (ms < 0) return "—";
  const s = Math.round(ms / 1000);
  return s < 60 ? `${s}s` : `${Math.round(s / 60)}m`;
}

function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop()?.toUpperCase() ?? "FILE" : "FILE";
}

function StatusIcon({ status }: { status: GithubPullRequestFile["status"] }) {
  const props = { size: 14, "aria-hidden": true as const };
  switch (status) {
    case "added":
      return <FilePlus2 {...props} style={{ color: "#4ade80" }} />;
    case "removed":
      return <FileMinus2 {...props} style={{ color: "var(--error)" }} />;
    case "modified":
      return <FilePenLine {...props} style={{ color: "var(--primary)" }} />;
    default:
      return <FileCode2 {...props} style={{ color: "var(--on-surface-variant)" }} />;
  }
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
  onViewAllDiffs,
  onTriggerReview,
  isStreaming,
  htmlUrl,
}: PrOverviewTabProps) {
  const [fileSearch, setFileSearch] = useState("");
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

  // Overall PR Churn calculations
  const totalAdditions = useMemo(
    () => files.reduce((acc, f) => acc + f.additions, 0),
    [files],
  );
  const totalDeletions = useMemo(
    () => files.reduce((acc, f) => acc + f.deletions, 0),
    [files],
  );
  const netChurn = totalAdditions - totalDeletions;

  // Find the file with the highest churn for 1-click triage
  const highestChurnFile = useMemo(() => {
    if (files.length === 0) return null;
    return [...files].sort((a, b) => b.additions + b.deletions - (a.additions + a.deletions))[0];
  }, [files]);

  // Filtered files list
  const filteredFiles = useMemo(() => {
    if (!fileSearch.trim()) return files;
    const query = fileSearch.toLowerCase().trim();
    return files.filter((f) => f.filename.toLowerCase().includes(query));
  }, [files, fileSearch]);

  return (
    <div className="mx-auto max-w-7xl pb-16">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column (2-cols wide) */}
        <div className="space-y-6 lg:col-span-2">
          {/* 1. AI Executive Summary */}
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
                <div className="mb-3 flex items-center justify-between">
                  <h2
                    className="text-base font-semibold"
                    style={{ color: "var(--on-surface)", fontFamily: "var(--font-geist-sans)" }}
                  >
                    AI Executive Summary
                  </h2>
                  {latestRun && (
                    <span
                      className="text-xs"
                      style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}
                    >
                      Updated {duration !== "—" ? `in ${duration}` : "just now"}
                    </span>
                  )}
                </div>

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
                      : "No AI summary yet. Click 'Run Review' above to generate instant insights."}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 2. Quick Triage Actions */}
          <div
            className="ghost-border rounded-xl p-5"
            style={{ background: "var(--surface-low)" }}
          >
            <h3
              className="mb-3.5 text-xs font-semibold uppercase tracking-wider"
              style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}
            >
              Quick Triage Actions
            </h3>
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={onViewAllDiffs}
                className="btn-primary inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold uppercase tracking-wider"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                <GitMerge className="h-4 w-4" aria-hidden />
                Review All Diffs ({files.length} files)
              </button>

              {highestChurnFile && (
                <button
                  type="button"
                  onClick={() => onSelectFile?.(highestChurnFile.filename)}
                  className="ghost-border inline-flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-xs font-semibold transition-colors hover:bg-[var(--surface-container)]"
                  style={{ color: "var(--on-surface)", fontFamily: "var(--font-space-grotesk)" }}
                >
                  <Flame className="h-4 w-4 text-[var(--tertiary)]" aria-hidden />
                  Jump to Highest Churn: <code className="font-mono">{highestChurnFile.filename}</code>
                </button>
              )}

              {htmlUrl && (
                <a
                  href={htmlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ghost-border inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2.5 text-xs font-semibold transition-opacity hover:opacity-80"
                  style={{ color: "var(--primary)", fontFamily: "var(--font-space-grotesk)" }}
                >
                  Open on GitHub
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                </a>
              )}
            </div>
          </div>

          {/* 3. Detailed Changed Files & Churn Breakdown */}
          <div
            className="ghost-border rounded-xl p-6"
            style={{ background: "var(--surface-low)" }}
          >
            {/* Header & Search */}
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3
                  className="text-base font-semibold"
                  style={{ color: "var(--on-surface)", fontFamily: "var(--font-geist-sans)" }}
                >
                  Changed Files & Churn Breakdown
                </h3>
                <p
                  className="mt-0.5 text-xs"
                  style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}
                >
                  {files.length} modified files in this PR
                </p>
              </div>

              {/* File Search */}
              <div className="relative w-full sm:w-64">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--on-surface-variant)]"
                  aria-hidden
                />
                <input
                  type="text"
                  value={fileSearch}
                  onChange={(e) => setFileSearch(e.target.value)}
                  placeholder="Filter files…"
                  className="ghost-border w-full rounded-lg bg-[var(--surface-container)] py-1.5 pl-8 pr-3 text-xs text-[var(--on-surface)] outline-none placeholder:text-[var(--on-surface-variant)] focus:ring-1 focus:ring-[var(--primary)]"
                  style={{ fontFamily: "var(--font-space-grotesk)" }}
                />
              </div>
            </div>

            {/* File List Table */}
            <div className="space-y-2">
              {filteredFiles.length === 0 ? (
                <p
                  className="py-8 text-center text-xs"
                  style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}
                >
                  No files matching &ldquo;{fileSearch}&rdquo;
                </p>
              ) : (
                filteredFiles.map((file) => {
                  const churnTotal = file.additions + file.deletions;
                  const addPercent =
                    churnTotal > 0 ? Math.round((file.additions / churnTotal) * 100) : 0;
                  const ext = getFileExtension(file.filename);

                  return (
                    <div
                      key={file.filename}
                      className="ghost-border flex flex-col gap-3 rounded-lg p-3 transition-colors hover:bg-[var(--surface-container)] sm:flex-row sm:items-center sm:justify-between"
                      style={{ background: "var(--surface-container-lowest)" }}
                    >
                      {/* Left: Icon, Filename & Status */}
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="shrink-0">
                          <StatusIcon status={file.status} />
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className="truncate text-xs font-semibold"
                              style={{
                                color: "var(--on-surface)",
                                fontFamily: "var(--font-geist-mono)",
                              }}
                              title={file.filename}
                            >
                              {file.filename}
                            </span>
                            <span
                              className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase"
                              style={{
                                background: "var(--surface-high)",
                                color: "var(--on-surface-variant)",
                                fontFamily: "var(--font-space-grotesk)",
                              }}
                            >
                              {ext}
                            </span>
                          </div>
                          <span
                            className="text-[11px] capitalize"
                            style={{
                              color: "var(--on-surface-variant)",
                              fontFamily: "var(--font-space-grotesk)",
                            }}
                          >
                            {file.status}
                          </span>
                        </div>
                      </div>

                      {/* Right: Churn Bar & 1-Click Diff Jump Button */}
                      <div className="flex shrink-0 items-center gap-4">
                        {/* Visual Churn Ratio Bar */}
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center gap-2 text-xs font-bold" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                            <span style={{ color: "#4ade80" }}>+{file.additions}</span>
                            <span style={{ color: "var(--error)" }}>−{file.deletions}</span>
                          </div>
                          <div className="flex h-1.5 w-24 overflow-hidden rounded-full bg-[var(--surface-high)]">
                            <div
                              style={{
                                width: `${addPercent}%`,
                                background: "#4ade80",
                              }}
                            />
                            <div
                              style={{
                                width: `${100 - addPercent}%`,
                                background: "var(--error)",
                              }}
                            />
                          </div>
                        </div>

                        {/* Inspect Diff Button */}
                        <button
                          type="button"
                          onClick={() => onSelectFile?.(file.filename)}
                          className="ghost-border inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors hover:bg-[var(--surface-high)]"
                          style={{
                            color: "var(--primary)",
                            fontFamily: "var(--font-space-grotesk)",
                          }}
                        >
                          Inspect Diff
                          <ArrowRight className="h-3 w-3" aria-hidden />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right column (1-col wide sidebar widgets) */}
        <div className="space-y-6">
          {/* 1. PR Health Scorecard */}
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

          {/* 2. PR Churn & Impact Overview Strip */}
          <div
            className="ghost-border rounded-xl p-6"
            style={{ background: "var(--surface-low)" }}
          >
            <h3
              className="mb-4 text-xs font-semibold uppercase tracking-wider"
              style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}
            >
              PR Churn Metrics
            </h3>

            <div className="space-y-3">
              <div
                className="flex items-center justify-between rounded-lg p-3"
                style={{ background: "var(--surface-container-lowest)" }}
              >
                <span className="text-xs text-[var(--on-surface-variant)]" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                  Total Lines Added
                </span>
                <span className="text-sm font-bold text-[#4ade80]" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                  +{totalAdditions}
                </span>
              </div>

              <div
                className="flex items-center justify-between rounded-lg p-3"
                style={{ background: "var(--surface-container-lowest)" }}
              >
                <span className="text-xs text-[var(--on-surface-variant)]" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                  Total Lines Deleted
                </span>
                <span className="text-sm font-bold text-[var(--error)]" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                  −{totalDeletions}
                </span>
              </div>

              <div
                className="flex items-center justify-between rounded-lg p-3"
                style={{ background: "var(--surface-container-lowest)" }}
              >
                <span className="text-xs text-[var(--on-surface-variant)]" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                  Net Impact
                </span>
                <span
                  className="text-sm font-bold"
                  style={{
                    color: netChurn >= 0 ? "var(--primary)" : "var(--tertiary)",
                    fontFamily: "var(--font-space-grotesk)",
                  }}
                >
                  {netChurn >= 0 ? `+${netChurn}` : netChurn} lines
                </span>
              </div>
            </div>
          </div>

          {/* 3. AI Model & Review Run Info */}
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
