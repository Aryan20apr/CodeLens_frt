"use client";

import { useRouter } from "next/navigation";
import * as Tabs from "@radix-ui/react-tabs";
import { AlertCircle, ArrowLeft, ExternalLink, Loader2 } from "lucide-react";
import { githubPullDiffPath } from "@/lib/github/github-routes";
import type { GithubPullRequest, GithubRepository, PullRequestState } from "@/lib/github/types";

const PR_STATES: { value: PullRequestState; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "closed", label: "Closed" },
  { value: "all", label: "All" },
];

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface GithubPullRequestsSectionProps {
  repo: GithubRepository;
  state: PullRequestState;
  pullRequests: GithubPullRequest[];
  isLoading: boolean;
  error: string | null;
  onBack: () => void;
  onStateChange: (state: PullRequestState) => void;
}

export function GithubPullRequestsSection({
  repo,
  state,
  pullRequests,
  isLoading,
  error,
  onBack,
  onStateChange,
}: GithubPullRequestsSectionProps) {
  const router = useRouter();

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-80"
            style={{ color: "var(--primary)", fontFamily: "var(--font-space-grotesk)" }}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to repositories
          </button>
          <div>
            <h2
              className="text-base font-semibold"
              style={{ color: "var(--on-surface)", fontFamily: "var(--font-geist-sans)" }}
            >
              Pull requests
            </h2>
            <p
              className="mt-1 text-sm"
              style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}
            >
              <span style={{ fontFamily: "var(--font-geist-mono)" }}>{repo.fullName}</span>
              {pullRequests.length > 0 && " · Click a row to open diff"}
            </p>
          </div>
        </div>

        <Tabs.Root
          value={state}
          onValueChange={(value) => {
            if (value === "open" || value === "closed" || value === "all") {
              onStateChange(value);
            }
          }}
        >
          <Tabs.List
            className="inline-flex gap-1 rounded-lg p-1"
            aria-label="Pull request state"
            style={{ background: "var(--surface-high)", border: "1px solid rgba(70,69,84,0.45)" }}
          >
            {PR_STATES.map(({ value, label }) => (
              <Tabs.Trigger
                key={value}
                value={value}
                className="rounded-md px-3 py-1.5 text-xs font-semibold transition-colors outline-none"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
                data-pr-state={value}
              >
                {label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
          <style>{`
            [data-pr-state] { color: var(--on-surface-variant); background: transparent; }
            [data-state="active"][data-pr-state] { color: var(--primary); background: var(--surface-container); }
          `}</style>
        </Tabs.Root>
      </div>

      {error && (
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
          <span>{error}</span>
        </div>
      )}

      <div
        className="overflow-hidden rounded-2xl"
        style={{ background: "var(--surface-container)", boxShadow: "var(--shadow-card)" }}
      >
        {isLoading ? (
          <div
            className="flex items-center gap-3 px-6 py-8 text-sm"
            style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}
          >
            <Loader2 className="h-4 w-4 animate-spin" style={{ color: "var(--primary)" }} aria-hidden />
            Loading pull requests…
          </div>
        ) : pullRequests.length === 0 ? (
          <p
            className="px-6 py-8 text-sm leading-6"
            style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}
          >
            No {state === "all" ? "" : `${state} `}pull requests found for this repository.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(70,69,84,0.12)" }}>
                  {["#", "Title", "Author", "State", "Updated", ""].map((col) => (
                    <th
                      key={col || "actions"}
                      className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{
                        color: "var(--on-surface-variant)",
                        fontFamily: "var(--font-space-grotesk)",
                      }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pullRequests.map((pr) => (
                    <tr
                    key={pr.number}
                    role="button"
                    tabIndex={0}
                    onClick={() => router.push(githubPullDiffPath(repo.repoId, pr.number))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        router.push(githubPullDiffPath(repo.repoId, pr.number));
                      }
                    }}
                    className="cursor-pointer transition-colors hover:opacity-95"
                    style={{
                      borderBottom: "1px solid rgba(70,69,84,0.08)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLTableRowElement).style.background =
                        "var(--surface-high)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLTableRowElement).style.background = "transparent";
                    }}
                  >
                    <td className="px-6 py-3.5">
                      <span
                        className="text-sm font-medium"
                        style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-geist-mono)" }}
                      >
                        {pr.number}
                      </span>
                    </td>
                    <td className="max-w-xs px-6 py-3.5 sm:max-w-md">
                      <span
                        className="text-sm font-medium"
                        style={{ color: "var(--on-surface)", fontFamily: "var(--font-geist-sans)" }}
                      >
                        {pr.title}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className="text-sm"
                        style={{
                          color: "var(--on-surface-variant)",
                          fontFamily: "var(--font-space-grotesk)",
                        }}
                      >
                        {pr.authorLogin}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className="inline-flex rounded-md px-2 py-0.5 text-xs font-semibold capitalize"
                        style={{
                          background: "var(--surface-highest)",
                          color: "var(--on-surface-variant)",
                          fontFamily: "var(--font-space-grotesk)",
                        }}
                      >
                        {pr.state}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className="text-sm whitespace-nowrap"
                        style={{
                          color: "var(--on-surface-variant)",
                          fontFamily: "var(--font-space-grotesk)",
                        }}
                      >
                        {formatDate(pr.updatedAt)}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <a
                        href={pr.htmlUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-80"
                        style={{ color: "var(--primary)", fontFamily: "var(--font-space-grotesk)" }}
                      >
                        Go to PR
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                      </a>
                    </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
