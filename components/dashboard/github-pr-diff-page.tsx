"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, ArrowLeft, CheckCircle2, ExternalLink, Loader2, Play } from "lucide-react";
import {
  GithubPrFileSidebar,
  pullRequestFileKey,
} from "@/components/dashboard/github-pr-file-sidebar";
import {
  DiffViewToggle,
  parseDiffViewType,
  type DiffViewType,
} from "@/components/dashboard/diff-view-toggle";
import { PrDiffFile } from "@/components/dashboard/pr-diff-file";
import { getAuthSession } from "@/lib/auth/session";
import { getPullRequest } from "@/lib/github/get-pull-request";
import { getPullRequestFiles } from "@/lib/github/get-pull-request-files";
import { githubPagePath } from "@/lib/github/github-routes";
import { GithubInstallApiError } from "@/lib/github/github-install";
import type { GithubPullRequestDetail, GithubPullRequestFile } from "@/lib/github/types";
import { ReviewRunWorkflow } from "@/components/dashboard/review-run-workflow";
import { consumeReviewRunStream } from "@/lib/review-runs/consume-review-run-stream";
import { isAbortError } from "@/lib/review-runs/is-abort-error";
import { ReviewRunSseParser } from "@/lib/review-runs/parse-review-run-sse";
import { ReviewRunApiError } from "@/lib/review-runs/review-run-api-error";
import { applyReviewRunStreamEvents } from "@/lib/review-runs/review-run-workflow-state";
import {
  INITIAL_REVIEW_RUN_WORKFLOW_STATE,
  type ReviewRunWorkflowState,
} from "@/lib/review-runs/review-run-stream-types";
import { triggerPullRequestReview } from "@/lib/review-runs/trigger-pull-request-review";

interface GithubPrDiffPageProps {
  repoId: string;
  pullNumber: string;
}

function parsePullNumber(value: string): number | null {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function GithubPrDiffPage({ repoId, pullNumber: pullNumberParam }: GithubPrDiffPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pullNumber = parsePullNumber(pullNumberParam);

  const [detail, setDetail] = useState<GithubPullRequestDetail | null>(null);
  const [files, setFiles] = useState<GithubPullRequestFile[]>([]);
  const [repoFullName, setRepoFullName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTriggeringReview, setIsTriggeringReview] = useState(false);
  const [reviewFeedback, setReviewFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [workflowState, setWorkflowState] = useState<ReviewRunWorkflowState>(
    INITIAL_REVIEW_RUN_WORKFLOW_STATE,
  );
  const [streamError, setStreamError] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const streamAbortRef = useRef<AbortController | null>(null);
  const sseParserRef = useRef(new ReviewRunSseParser());

  const fileFromQuery = searchParams.get("file");
  const diffView = parseDiffViewType(searchParams.get("view"));
  const [selectedFileKey, setSelectedFileKey] = useState<string | null>(fileFromQuery);

  const loadDiff = useCallback(async () => {
    if (pullNumber == null) {
      setError("Invalid pull request number.");
      setIsLoading(false);
      return;
    }

    const session = getAuthSession();
    if (!session?.accessToken) {
      setError("Your session is missing an access token. Please sign in again.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [prDetail, prFiles] = await Promise.all([
        getPullRequest(session.accessToken, repoId, pullNumber),
        getPullRequestFiles(session.accessToken, repoId, pullNumber),
      ]);
      setDetail(prDetail);
      setFiles(prFiles);

      const match = prDetail.htmlUrl.match(/github\.com\/([^/]+\/[^/]+)\//i);
      setRepoFullName(match?.[1] ?? null);
    } catch (err) {
      setDetail(null);
      setFiles([]);
      if (err instanceof GithubInstallApiError) {
        setError(err.message);
      } else {
        setError("Could not load pull request diff.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [repoId, pullNumber]);

  useEffect(() => {
    void loadDiff();
  }, [loadDiff]);

  useEffect(() => {
    return () => {
      streamAbortRef.current?.abort();
    };
  }, []);

  const startReviewStream = useCallback((accessToken: string, reviewRunId: string) => {
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
      } catch (err) {
        if (controller.signal.aborted || isAbortError(err)) return;
        const message =
          err instanceof ReviewRunApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Review stream disconnected unexpectedly.";
        setStreamError(message);
      } finally {
        if (streamAbortRef.current === controller) {
          setIsStreaming(false);
          streamAbortRef.current = null;
        }
      }
    })();
  }, []);

  useEffect(() => {
    if (files.length === 0) return;
    const keys = files.map(pullRequestFileKey);
    const preferred =
      fileFromQuery && keys.includes(fileFromQuery) ? fileFromQuery : (keys[0] ?? null);
    setSelectedFileKey((current) =>
      current && keys.includes(current) ? current : preferred,
    );
  }, [files, fileFromQuery]);

  const selectedFile = useMemo(
    () => files.find((file) => pullRequestFileKey(file) === selectedFileKey) ?? null,
    [files, selectedFileKey],
  );

  function updateSearchParams(patch: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    patch(params);
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  function handleSelectFile(key: string) {
    setSelectedFileKey(key);
    updateSearchParams((params) => {
      params.set("file", key);
    });
  }

  function handleDiffViewChange(next: DiffViewType) {
    updateSearchParams((params) => {
      if (next === "unified") {
        params.delete("view");
      } else {
        params.set("view", next);
      }
    });
  }

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
        startReviewStream(session.accessToken, reviewRunId);
      } catch (err) {
        if (err instanceof ReviewRunApiError) {
          setReviewFeedback({ type: "error", message: err.message });
        } else {
          setReviewFeedback({
            type: "error",
            message: "Could not start pull request review.",
          });
        }
      } finally {
        setIsTriggeringReview(false);
      }
    })();
  }

  const backHref = githubPagePath(repoId);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header
        className="flex shrink-0 flex-col gap-3 border-b px-8 py-4 sm:flex-row sm:items-center sm:justify-between"
        style={{
          background: "var(--surface-container)",
          borderColor: "rgba(70,69,84,0.2)",
        }}
      >
        <div className="flex min-w-0 flex-col gap-2">
          <Link
            href={backHref}
            className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-80"
            style={{ color: "var(--primary)", fontFamily: "var(--font-space-grotesk)" }}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to pull requests
          </Link>
          {detail ? (
            <div className="min-w-0">
              <h1
                className="truncate text-lg font-bold"
                style={{ color: "var(--on-surface)", fontFamily: "var(--font-geist-sans)" }}
              >
                #{detail.number} {detail.title}
              </h1>
              <p
                className="mt-0.5 truncate text-sm"
                style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}
              >
                {repoFullName && (
                  <span style={{ fontFamily: "var(--font-geist-mono)" }}>{repoFullName}</span>
                )}
                {repoFullName && " · "}
                {detail.authorLogin}
                {" · "}
                <span className="capitalize">{detail.state}</span>
                {detail.draft ? " · draft" : ""}
              </p>
            </div>
          ) : (
            <h1
              className="text-lg font-bold"
              style={{ color: "var(--on-surface)", fontFamily: "var(--font-geist-sans)" }}
            >
              Pull request diff
            </h1>
          )}
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          {detail && pullNumber != null && !isLoading && (
            <button
              type="button"
              onClick={handleTriggerReview}
              disabled={isTriggeringReview}
              className="btn-primary inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold disabled:pointer-events-none disabled:opacity-50"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              {isTriggeringReview ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Play className="h-4 w-4" fill="currentColor" aria-hidden />
              )}
              {isTriggeringReview ? "Starting review…" : "Run review"}
            </button>
          )}
          {!isLoading && files.length > 0 && (
            <DiffViewToggle value={diffView} onChange={handleDiffViewChange} />
          )}
          {detail && (
            <a
              href={detail.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-80"
              style={{ color: "var(--primary)", fontFamily: "var(--font-space-grotesk)" }}
            >
              Go to PR
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
          )}
        </div>
      </header>

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
          <span>{error}</span>
        </div>
      )}

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
          {reviewFeedback.type === "error" ? (
            <AlertCircle
              className="mt-0.5 h-4 w-4 shrink-0"
              style={{ color: "var(--error)" }}
              aria-hidden
            />
          ) : (
            <CheckCircle2
              className="mt-0.5 h-4 w-4 shrink-0"
              style={{ color: "var(--primary)" }}
              aria-hidden
            />
          )}
          <span>{reviewFeedback.message}</span>
        </div>
      )}

      {isLoading ? (
        <div
          className="flex flex-1 items-center justify-center gap-3 px-8 py-16 text-sm"
          style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}
        >
          <Loader2 className="h-5 w-5 animate-spin" style={{ color: "var(--primary)" }} aria-hidden />
          Loading diff…
        </div>
      ) : files.length === 0 ? (
        <p
          className="px-8 py-16 text-sm"
          style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}
        >
          No changed files in this pull request.
        </p>
      ) : (
        <div className="flex min-h-0 flex-1">
          <GithubPrFileSidebar
            files={files}
            selectedKey={selectedFileKey}
            onSelect={handleSelectFile}
          />
          <div
            className="min-w-0 flex-1 overflow-y-auto p-6"
            style={{ background: "var(--surface)" }}
          >
            {selectedFile ? (
              <>
                <h2
                  className="mb-4 truncate text-sm font-semibold"
                  style={{ color: "var(--on-surface)", fontFamily: "var(--font-geist-mono)" }}
                >
                  {selectedFile.filename}
                </h2>
                <PrDiffFile file={selectedFile} viewType={diffView} />
              </>
            ) : (
              <p
                className="text-sm"
                style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}
              >
                Select a file to view its diff.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
