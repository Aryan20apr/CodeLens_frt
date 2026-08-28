"use client";

import { GitCommit, Clock, Zap, Webhook, Loader2, AlertCircle } from "lucide-react";
import type { ReviewRun } from "@/lib/review-runs/review-run-types";

interface PrRunHistoryTabProps {
  runs: ReviewRun[];
  isLoading: boolean;
  error: string | null;
  activeRunId: string | null;
  onSelectRun: (runId: string) => void;
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatDuration(createdAt: string, completedAt: string | null): string {
  if (!completedAt) return "—";
  const ms = new Date(completedAt).getTime() - new Date(createdAt).getTime();
  if (ms < 0) return "—";
  const s = Math.round(ms / 1000);
  return s < 60 ? `${s}s` : `${Math.round(s / 60)}m`;
}

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  COMPLETED: { bg: "rgba(74,222,128,0.15)", text: "#4ade80" },
  FAILED: { bg: "rgba(255,180,171,0.15)", text: "var(--error)" },
  RUNNING: { bg: "rgba(192,193,255,0.15)", text: "var(--primary)" },
  PENDING: { bg: "rgba(192,193,255,0.10)", text: "var(--on-surface-variant)" },
};

function cleanSummaryPreview(text: string): string {
  return text
    .replace(/^##\s*(Overview|Summary)\s*/i, "")
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .trim();
}

export function PrRunHistoryTab({
  runs,
  isLoading,
  error,
  activeRunId,
  onSelectRun,
}: PrRunHistoryTabProps) {
  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center gap-2 py-20 text-sm"
        style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}
      >
        <Loader2 className="h-4 w-4 animate-spin" style={{ color: "var(--primary)" }} aria-hidden />
        Loading review history…
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="flex items-start gap-3 rounded-2xl p-4 text-sm"
        style={{
          background: "rgba(255,180,171,0.1)",
          border: "1px solid rgba(255,180,171,0.3)",
          color: "var(--on-surface)",
          fontFamily: "var(--font-space-grotesk)",
        }}
      >
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--error)" }} aria-hidden />
        {error}
      </div>
    );
  }

  if (runs.length === 0) {
    return (
      <p
        className="py-16 text-center text-sm"
        style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}
      >
        No review runs yet. Click &ldquo;Run Review&rdquo; to start the first AI analysis.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {runs.map((run, index) => {
        const styles = STATUS_STYLES[run.status] ?? STATUS_STYLES.PENDING;
        const isActive = run.id === activeRunId;
        return (
          <button
            key={run.id}
            type="button"
            onClick={() => onSelectRun(run.id)}
            className="ghost-border w-full rounded-xl p-5 text-left transition-colors hover:bg-[var(--surface-container)]"
            style={{
              background: isActive ? "var(--surface-container)" : "var(--surface-low)",
              outline: isActive ? "1px solid rgba(192,193,255,0.3)" : "none",
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className="rounded px-2 py-0.5 text-xs font-bold"
                    style={{ background: styles.bg, color: styles.text, fontFamily: "var(--font-space-grotesk)" }}
                  >
                    {run.status}
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}
                  >
                    Run #{runs.length - index}
                    {index === 0 ? " (Latest)" : ""}
                  </span>
                  {run.triggeredBy === "WEBHOOK" ? (
                    <Webhook
                      className="h-3.5 w-3.5"
                      style={{ color: "var(--on-surface-variant)" }}
                      aria-label="Auto-triggered via webhook"
                    />
                  ) : (
                    <Zap
                      className="h-3.5 w-3.5"
                      style={{ color: "var(--on-surface-variant)" }}
                      aria-label="Manually triggered"
                    />
                  )}
                </div>
                {run.summaryText && (
                  <p
                    className="mt-2 line-clamp-2 text-sm leading-relaxed"
                    style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-inter)" }}
                  >
                    {cleanSummaryPreview(run.summaryText)}
                  </p>
                )}
              </div>
              <div className="shrink-0 space-y-1 text-right">
                <div
                  className="flex items-center justify-end gap-1 text-xs"
                  style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}
                >
                  <GitCommit className="h-3 w-3" aria-hidden />
                  {run.headSha.slice(0, 7)}
                </div>
                <div
                  className="flex items-center justify-end gap-1 text-xs"
                  style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}
                >
                  <Clock className="h-3 w-3" aria-hidden />
                  {formatDuration(run.createdAt, run.completedAt)}
                </div>
                <p
                  className="text-xs"
                  style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}
                >
                  {formatRelativeTime(run.createdAt)}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
