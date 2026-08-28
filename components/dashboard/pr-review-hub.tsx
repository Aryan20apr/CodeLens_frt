"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  Play,
  Loader2,
  AlertCircle,
  Sparkles,
  GitMerge,
  History,
  Copy,
  Check,
  ShieldAlert,
  FileCode2,
} from "lucide-react";
import { getAuthSession } from "@/lib/auth/session";
import { getPullRequest } from "@/lib/github/get-pull-request";
import { getPullRequestFiles } from "@/lib/github/get-pull-request-files";
import { githubPagePath } from "@/lib/github/github-routes";
import { GithubInstallApiError } from "@/lib/github/github-install";
import type { GithubPullRequestDetail, GithubPullRequestFile } from "@/lib/github/types";
import { getReviewRuns } from "@/lib/review-runs/get-review-runs";
import type { ReviewRun } from "@/lib/review-runs/review-run-types";
import {
  triggerPullRequestReview,
  ReviewRunApiError,
} from "@/lib/review-runs/trigger-pull-request-review";
import { consumeReviewRunStream } from "@/lib/review-runs/consume-review-run-stream";
import { isAbortError } from "@/lib/review-runs/is-abort-error";
import { ReviewRunSseParser } from "@/lib/review-runs/parse-review-run-sse";
import { applyReviewRunStreamEvents } from "@/lib/review-runs/review-run-workflow-state";
import {
  INITIAL_REVIEW_RUN_WORKFLOW_STATE,
  type ReviewRunWorkflowState,
} from "@/lib/review-runs/review-run-stream-types";
import { ReviewRunWorkflow } from "@/components/dashboard/review-run-workflow";
import {
  GithubPrFileSidebar,
  pullRequestFileKey,
} from "@/components/dashboard/github-pr-file-sidebar";
import { PrDiffFile } from "@/components/dashboard/pr-diff-file";
import { DiffViewToggle, parseDiffViewType } from "@/components/dashboard/diff-view-toggle";
import type { DiffViewType } from "@/components/dashboard/diff-view-toggle";
import { PrOverviewTab } from "@/components/dashboard/pr-overview-tab";
import { PrRunHistoryTab } from "@/components/dashboard/pr-run-history-tab";

type PrTab = "overview" | "diff" | "history";

interface PrReviewHubProps {
  repoId: string;
  pullNumber: string;
}

function parsePullNumber(value: string): number | null {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function PrReviewHub({ repoId, pullNumber: pullNumberParam }: PrReviewHubProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pullNumber = parsePullNumber(pullNumberParam);

  const [detail, setDetail] = useState<GithubPullRequestDetail | null>(null);
  const [files, setFiles] = useState<GithubPullRequestFile[]>([]);
  const [repoFullName, setRepoFullName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<PrTab>("overview");
  const [copiedReview, setCopiedReview] = useState(false);

  const fileFromQuery = searchParams.get("file");
  const diffView = parseDiffViewType(searchParams.get("view"));
  const [selectedFileKey, setSelectedFileKey] = useState<string | null>(fileFromQuery);

  const [runs, setRuns] = useState<ReviewRun[]>([]);
  const [isLoadingRuns, setIsLoadingRuns] = useState(false);
  const [runsError, setRunsError] = useState<string | null>(null);
  const [activeRunId, setActiveRunId] = useState<string | null>(null);

  const [isTriggeringReview, setIsTriggeringReview] = useState(false);
  const [reviewFeedback, setReviewFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [workflowState, setWorkflowState] =
    useState<ReviewRunWorkflowState>(INITIAL_REVIEW_RUN_WORKFLOW_STATE);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const streamAbortRef = useRef<AbortController | null>(null);
  const sseParserRef = useRef(new ReviewRunSseParser());

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (pullNumber == null) {
        if (!cancelled) {
          setError("Invalid pull request number.");
          setIsLoading(false);
        }
        return;
      }
      const session = getAuthSession();
      if (!session?.accessToken) {
        if (!cancelled) {
          setError("Session missing access token. Please sign in again.");
          setIsLoading(false);
        }
        return;
      }
      try {
        const [prDetail, prFiles] = await Promise.all([
          getPullRequest(session.accessToken, repoId, pullNumber),
          getPullRequestFiles(session.accessToken, repoId, pullNumber),
        ]);
        if (cancelled) return;
        setDetail(prDetail);
        setFiles(prFiles);
        // Extract repoFullName from htmlUrl (https://github.com/owner/repo/pull/42)
        const match = prDetail.htmlUrl.match(/github\.com\/([^/]+\/[^/]+)\//i);
        setRepoFullName(match?.[1] ?? null);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof GithubInstallApiError) {
          setError(err.message);
        } else {
          setError(err instanceof Error ? err.message : "Could not load pull request diff.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [repoId, pullNumber]);

  useEffect(() => {
    if (!repoFullName || pullNumber == null) return;
    let cancelled = false;
    async function loadRuns() {
      const session = getAuthSession();
      if (!session?.accessToken) return;
      setIsLoadingRuns(true);
      setRunsError(null);
      try {
        const list = await getReviewRuns(session.accessToken, repoFullName!, pullNumber!);
        if (cancelled) return;
        setRuns(list.items);
        if (list.items.length > 0) setActiveRunId(list.items[0].id);
      } catch (err) {
        if (!cancelled) {
          setRunsError(err instanceof Error ? err.message : "Could not load review runs.");
        }
      } finally {
        if (!cancelled) setIsLoadingRuns(false);
      }
    }
    void loadRuns();
    return () => {
      cancelled = true;
    };
  }, [repoFullName, pullNumber]);

  useEffect(() => {
    return () => {
      streamAbortRef.current?.abort();
    };
  }, []);

  const latestRun = useMemo(() => runs[0] ?? null, [runs]);

  const startReviewStream = useCallback(
    (accessToken: string, reviewRunId: string) => {
      streamAbortRef.current?.abort();
      const controller = new AbortController();
      streamAbortRef.current = controller;
      sseParserRef.current.reset();
      setStreamError(null);
      setWorkflowState(INITIAL_REVIEW_RUN_WORKFLOW_STATE);
      setIsStreaming(true);

      void (async () => {
        try {
          await consumeReviewRunStream({
            accessToken,
            reviewRunId,
            signal: controller.signal,
            onChunk: (chunk) => {
              const events = sseParserRef.current.push(chunk);
              if (events.length === 0) return;
              setWorkflowState((prev) => applyReviewRunStreamEvents(prev, events));
            },
          });
          // Refresh run history after stream completes
          if (repoFullName && pullNumber != null) {
            const session = getAuthSession();
            if (session?.accessToken) {
              getReviewRuns(session.accessToken, repoFullName, pullNumber)
                .then((list) => {
                  setRuns(list.items);
                  if (list.items.length > 0) setActiveRunId(list.items[0].id);
                })
                .catch(() => null);
            }
          }
        } catch (err) {
          if (controller.signal.aborted || isAbortError(err)) return;
          setStreamError(
            err instanceof Error ? err.message : "Review stream disconnected unexpectedly.",
          );
        } finally {
          if (streamAbortRef.current === controller) {
            setIsStreaming(false);
            streamAbortRef.current = null;
          }
        }
      })();
    },
    [repoFullName, pullNumber],
  );

  function handleTriggerReview() {
    if (pullNumber == null || isTriggeringReview) return;
    const session = getAuthSession();
    if (!session?.accessToken) {
      setReviewFeedback({
        type: "error",
        message: "Your session is missing an access token. Please sign in again.",
      });
      return;
    }
    setReviewFeedback(null);
    setIsTriggeringReview(true);
    void (async () => {
      try {
        const reviewRunId = await triggerPullRequestReview(
          session.accessToken,
          repoId,
          pullNumber,
        );
        setReviewFeedback(null);
        setActiveTab("overview");
        startReviewStream(session.accessToken, reviewRunId);
      } catch (err) {
        setReviewFeedback({
          type: "error",
          message:
            err instanceof ReviewRunApiError
              ? err.message
              : "Could not start pull request review.",
        });
      } finally {
        setIsTriggeringReview(false);
      }
    })();
  }

  function updateSearchParams(patch: (p: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    patch(params);
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  function handleJumpToFile(filename: string) {
    const target = files.find((f) => f.filename === filename);
    if (target) {
      const key = pullRequestFileKey(target);
      setSelectedFileKey(key);
      updateSearchParams((p) => p.set("file", key));
    }
    setActiveTab("diff");
  }

  async function handleCopyReview() {
    if (!latestRun?.summaryText) return;
    try {
      await navigator.clipboard.writeText(
        `# AI Code Review Summary — ${detail?.title ?? `PR #${pullNumber}`}\n\n${latestRun.summaryText}`,
      );
      setCopiedReview(true);
      setTimeout(() => setCopiedReview(false), 2500);
    } catch {
      // ignore clipboard error
    }
  }

  const effectiveSelectedFileKey = useMemo(() => {
    if (files.length === 0) return null;
    const keys = files.map(pullRequestFileKey);
    if (selectedFileKey && keys.includes(selectedFileKey)) return selectedFileKey;
    if (fileFromQuery && keys.includes(fileFromQuery)) return fileFromQuery;
    return keys[0] ?? null;
  }, [files, selectedFileKey, fileFromQuery]);

  const selectedFile = useMemo(
    () => files.find((f) => pullRequestFileKey(f) === effectiveSelectedFileKey) ?? null,
    [files, effectiveSelectedFileKey],
  );

  const totalAdditions = files.reduce((s, f) => s + f.additions, 0);
  const totalDeletions = files.reduce((s, f) => s + f.deletions, 0);
  const backHref = githubPagePath(repoId);

  // Derive risk rating based on churn and warnings
  const riskRating = useMemo(() => {
    const churn = totalAdditions + totalDeletions;
    const summary = latestRun?.summaryText?.toLowerCase() ?? "";
    if (summary.includes("vulnerability") || summary.includes("sql injection") || churn > 500) {
      return { label: "High Risk", color: "var(--tertiary)", bg: "rgba(255, 183, 131, 0.12)" };
    }
    if (churn > 150 || summary.includes("warning")) {
      return { label: "Moderate Risk", color: "var(--primary)", bg: "rgba(192, 193, 255, 0.12)" };
    }
    return { label: "Low Risk", color: "#4ade80", bg: "rgba(74, 222, 128, 0.12)" };
  }, [totalAdditions, totalDeletions, latestRun?.summaryText]);

  const TABS: { id: PrTab; label: string; icon: typeof Sparkles }[] = [
    { id: "overview", label: "Overview & AI Walkthrough", icon: Sparkles },
    { id: "diff", label: `Files & Diffs (${files.length})`, icon: GitMerge },
    { id: "history", label: `Review History (${runs.length})`, icon: History },
  ];

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden">
      {/* Ambient background glow */}
      <div
        className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full opacity-5 blur-[120px]"
        style={{ background: "var(--primary)" }}
      />

      {/* Header */}
      <header
        className="shrink-0 px-8 pb-0 pt-6"
        style={{
          background: "rgba(20, 19, 22, 0.95)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(70, 69, 84, 0.25)",
        }}
      >
        {/* Breadcrumb */}
        <div
          className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider"
          style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}
        >
          <Link
            href={backHref}
            className="inline-flex items-center gap-1 transition-opacity hover:opacity-80"
            style={{ color: "var(--primary)" }}
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            {repoFullName ?? "Repositories"}
          </Link>
          <span style={{ color: "rgba(70,69,84,0.6)" }}>/</span>
          <span>Pull Request #{detail?.number ?? pullNumber}</span>
        </div>

        {/* Title + actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <h1
              className="truncate text-2xl font-bold tracking-tight"
              style={{ color: "var(--on-surface)", fontFamily: "var(--font-geist-sans)" }}
            >
              {detail?.title ?? "Pull request"}
            </h1>
            <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
              {detail && (
                <span
                  className="inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-bold capitalize"
                  style={{
                    background:
                      detail.state === "open"
                        ? "rgba(74,222,128,0.15)"
                        : "rgba(139,92,246,0.15)",
                    color: detail.state === "open" ? "#4ade80" : "#a78bfa",
                    fontFamily: "var(--font-space-grotesk)",
                  }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{
                      background: detail.state === "open" ? "#4ade80" : "#a78bfa",
                    }}
                  />
                  {detail.state}
                  {detail.draft ? " (draft)" : ""}
                </span>
              )}
              {latestRun && (
                <button
                  type="button"
                  onClick={() => setActiveTab("history")}
                  className="ghost-border inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs transition-colors hover:bg-[var(--surface-container)]"
                  style={{
                    background: "var(--surface-high)",
                    color: "var(--on-surface)",
                    fontFamily: "var(--font-space-grotesk)",
                  }}
                  title="View run history"
                >
                  <History className="h-3 w-3 text-[var(--primary)]" aria-hidden />
                  Latest: <code className="font-mono font-semibold">{latestRun.headSha.slice(0, 7)}</code>
                </button>
              )}
              {files.length > 0 && (
                <span
                  className="text-xs font-semibold"
                  style={{
                    color: "var(--on-surface-variant)",
                    fontFamily: "var(--font-space-grotesk)",
                  }}
                >
                  <span style={{ color: "#4ade80" }}>+{totalAdditions}</span>
                  {" / "}
                  <span style={{ color: "var(--error)" }}>−{totalDeletions}</span>
                  {" churn"}
                </span>
              )}
              {latestRun?.summaryText && (
                <span
                  className="ghost-border inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-semibold"
                  style={{
                    background: riskRating.bg,
                    color: riskRating.color,
                    fontFamily: "var(--font-space-grotesk)",
                  }}
                >
                  <ShieldAlert className="h-3.5 w-3.5" aria-hidden />
                  {riskRating.label}
                </span>
              )}
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex shrink-0 flex-wrap items-center gap-2.5">
            {latestRun?.summaryText && (
              <button
                type="button"
                onClick={handleCopyReview}
                className="ghost-border inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-colors hover:bg-[var(--surface-container)]"
                style={{
                  color: copiedReview ? "#4ade80" : "var(--on-surface-variant)",
                  fontFamily: "var(--font-space-grotesk)",
                }}
              >
                {copiedReview ? (
                  <>
                    <Check className="h-3.5 w-3.5" aria-hidden />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" aria-hidden />
                    Copy Markdown
                  </>
                )}
              </button>
            )}

            {detail && pullNumber != null && !isLoading && (
              <button
                type="button"
                onClick={handleTriggerReview}
                disabled={isTriggeringReview || isStreaming}
                className="btn-primary inline-flex h-9 items-center gap-2 rounded-lg px-4 text-xs font-bold uppercase tracking-wider disabled:pointer-events-none disabled:opacity-50"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                {isTriggeringReview || isStreaming ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Play className="h-3.5 w-3.5" fill="currentColor" aria-hidden />
                )}
                {isTriggeringReview
                  ? "Starting…"
                  : isStreaming
                  ? "Reviewing…"
                  : latestRun
                  ? "Re-run Review"
                  : "Run Review"}
              </button>
            )}

            {detail && (
              <a
                href={detail.htmlUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ghost-border inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-opacity hover:opacity-80"
                style={{ color: "var(--primary)", fontFamily: "var(--font-space-grotesk)" }}
              >
                View on GitHub
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              </a>
            )}
          </div>
        </div>

        {/* Tab nav */}
        <nav
          className="mt-6 flex gap-2"
          aria-label="PR review sections"
        >
          {TABS.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(id)}
                className="relative flex items-center gap-2 px-4 pb-3.5 text-sm font-semibold transition-colors"
                style={{
                  color: isActive ? "var(--primary)" : "var(--on-surface-variant)",
                  fontFamily: "var(--font-space-grotesk)",
                }}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                {label}
                {isActive && (
                  <div
                    className="absolute inset-x-0 bottom-0 h-0.5"
                    style={{
                      background: "var(--primary)",
                      boxShadow: "0 0 10px var(--primary)",
                    }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </header>

      {/* Banners */}
      {error && (
        <div
          role="alert"
          className="mx-8 mt-4 flex items-start gap-3 rounded-2xl p-4 text-sm"
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
      )}

      {/* Workflow streaming progress */}
      <ReviewRunWorkflow
        state={workflowState}
        isStreaming={isStreaming}
        streamError={streamError}
      />

      {reviewFeedback && (
        <div
          role={reviewFeedback.type === "error" ? "alert" : "status"}
          className="mx-8 mt-4 flex items-start gap-3 rounded-2xl p-4 text-sm"
          style={{
            background:
              reviewFeedback.type === "error"
                ? "rgba(255,180,171,0.1)"
                : "rgba(192,193,255,0.1)",
            border:
              reviewFeedback.type === "error"
                ? "1px solid rgba(255,180,171,0.3)"
                : "1px solid rgba(192,193,255,0.3)",
            color: "var(--on-surface)",
            fontFamily: "var(--font-space-grotesk)",
          }}
        >
          <AlertCircle
            className="mt-0.5 h-4 w-4 shrink-0"
            style={{
              color: reviewFeedback.type === "error" ? "var(--error)" : "var(--primary)",
            }}
            aria-hidden
          />
          {reviewFeedback.message}
        </div>
      )}

      {/* Main Tab Panels */}
      {isLoading ? (
        <div
          className="flex flex-1 items-center justify-center gap-3 py-16 text-sm"
          style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}
        >
          <Loader2 className="h-5 w-5 animate-spin" style={{ color: "var(--primary)" }} aria-hidden />
          Loading pull request details…
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 overflow-hidden">
          {/* 1. Overview Tab */}
          {activeTab === "overview" && (
            <div className="flex-1 overflow-y-auto p-8">
              <PrOverviewTab
                latestRun={latestRun}
                files={files}
                isLoadingRun={isLoadingRuns}
                onSelectFile={handleJumpToFile}
                onViewAllDiffs={() => setActiveTab("diff")}
                onTriggerReview={handleTriggerReview}
                isStreaming={isStreaming || isTriggeringReview}
                htmlUrl={detail?.htmlUrl}
              />
            </div>
          )}

          {/* 2. Files & Diffs Tab */}
          {activeTab === "diff" && (
            <div className="flex min-h-0 flex-1 overflow-hidden">
              {files.length === 0 ? (
                <p
                  className="p-8 text-sm"
                  style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}
                >
                  No changed files in this pull request.
                </p>
              ) : (
                <>
                  {/* Left Sidebar */}
                  <GithubPrFileSidebar
                    files={files}
                    selectedKey={effectiveSelectedFileKey}
                    onSelect={(key) => {
                      setSelectedFileKey(key);
                      updateSearchParams((p) => p.set("file", key));
                    }}
                  />

                  {/* Main Diff Area with Sticky Integrated Header */}
                  <div
                    className="flex min-w-0 flex-1 flex-col overflow-hidden"
                    style={{ background: "var(--surface)" }}
                  >
                    {selectedFile && (
                      <header
                        className="flex shrink-0 items-center justify-between border-b px-6 py-3"
                        style={{
                          background: "var(--surface-low)",
                          borderColor: "rgba(70,69,84,0.2)",
                        }}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <FileCode2
                            className="h-4 w-4 shrink-0"
                            style={{ color: "var(--primary)" }}
                            aria-hidden
                          />
                          <span
                            className="truncate text-sm font-semibold"
                            style={{
                              color: "var(--on-surface)",
                              fontFamily: "var(--font-geist-mono)",
                            }}
                          >
                            {selectedFile.filename}
                          </span>
                          <span
                            className="rounded px-2 py-0.5 text-xs font-bold capitalize"
                            style={{
                              background: "var(--surface-high)",
                              color: "var(--on-surface-variant)",
                              fontFamily: "var(--font-space-grotesk)",
                            }}
                          >
                            {selectedFile.status}
                          </span>
                          <span
                            className="text-xs font-semibold"
                            style={{ fontFamily: "var(--font-space-grotesk)" }}
                          >
                            <span style={{ color: "#4ade80" }}>+{selectedFile.additions}</span>{" "}
                            <span style={{ color: "var(--error)" }}>−{selectedFile.deletions}</span>
                          </span>
                        </div>

                        {/* Diff View Toggle neatly docked on the right */}
                        <div className="shrink-0">
                          <DiffViewToggle
                            value={diffView}
                            onChange={(next: DiffViewType) => {
                              updateSearchParams((p) => {
                                if (next === "unified") p.delete("view");
                                else p.set("view", next);
                              });
                            }}
                          />
                        </div>
                      </header>
                    )}

                    {/* Diff Body */}
                    <div className="flex-1 overflow-y-auto p-6">
                      {selectedFile ? (
                        <PrDiffFile
                          file={selectedFile}
                          viewType={diffView}
                          showHeader={false}
                        />
                      ) : (
                        <p
                          className="text-sm"
                          style={{
                            color: "var(--on-surface-variant)",
                            fontFamily: "var(--font-space-grotesk)",
                          }}
                        >
                          Select a file to view its diff.
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* 3. History Tab */}
          {activeTab === "history" && (
            <div className="flex-1 overflow-y-auto p-8">
              <div className="mx-auto max-w-4xl">
                <PrRunHistoryTab
                  runs={runs}
                  isLoading={isLoadingRuns}
                  error={runsError}
                  activeRunId={activeRunId}
                  onSelectRun={setActiveRunId}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
