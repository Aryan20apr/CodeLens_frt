"use client";

import { useMemo } from "react";
import { Diff, Hunk, parseDiff } from "react-diff-view";
import type { FileData, ViewType } from "react-diff-view";
import type { DiffViewType } from "@/components/dashboard/diff-view-toggle";
import { normalizeGithubPatch } from "@/lib/github/normalize-github-patch";
import type { GithubPullRequestFile } from "@/lib/github/types";
import "react-diff-view/style/index.css";
import "./pr-diff-view.css";

interface PrDiffFileProps {
  file: GithubPullRequestFile;
  viewType?: DiffViewType;
  /** When false, only the diff table is shown (file meta lives in the sidebar). */
  showHeader?: boolean;
}

function getDisplayPath(file: GithubPullRequestFile): string {
  if (file.status === "renamed" && file.previousFilename) {
    return `${file.previousFilename} → ${file.filename}`;
  }
  return file.filename;
}

export function PrDiffFile({ file, viewType = "unified", showHeader = false }: PrDiffFileProps) {
  const diffViewType: ViewType = viewType;
  const parsed = useMemo((): FileData | null => {
    const normalized = normalizeGithubPatch(file);
    if (!normalized) return null;
    try {
      const files = parseDiff(normalized);
      const first = files[0];
      if (!first?.hunks?.length) return null;
      return first;
    } catch {
      return null;
    }
  }, [file]);

  return (
    <article
      className="overflow-hidden rounded-xl"
      style={{ border: "1px solid rgba(70,69,84,0.2)" }}
    >
      {showHeader && (
        <header
          className="flex flex-wrap items-center gap-2 px-4 py-2.5"
          style={{
            background: "var(--surface-high)",
            borderBottom: "1px solid rgba(70,69,84,0.12)",
          }}
        >
          <span
            className="text-sm font-medium"
            style={{ color: "var(--on-surface)", fontFamily: "var(--font-geist-mono)" }}
          >
            {getDisplayPath(file)}
          </span>
          <span
            className="rounded-md px-2 py-0.5 text-xs font-semibold capitalize"
            style={{
              background: "var(--surface-highest)",
              color: "var(--on-surface-variant)",
              fontFamily: "var(--font-space-grotesk)",
            }}
          >
            {file.status}
          </span>
          <span
            className="text-xs font-semibold"
            style={{ color: "var(--primary)", fontFamily: "var(--font-space-grotesk)" }}
          >
            +{file.additions}
          </span>
          <span
            className="text-xs font-semibold"
            style={{ color: "var(--error)", fontFamily: "var(--font-space-grotesk)" }}
          >
            −{file.deletions}
          </span>
        </header>
      )}

      {!parsed ? (
        <p
          className="px-4 py-6 text-sm"
          style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}
        >
          No diff patch available for this file.
        </p>
      ) : (
        <div className="pr-diff-root overflow-x-auto">
          <Diff viewType={diffViewType} diffType={parsed.type} hunks={parsed.hunks}>
            {(hunks) =>
              hunks.map((hunk, index) => (
                <Hunk
                  key={`${hunk.oldStart}-${hunk.newStart}-${index}-${hunk.content}`}
                  hunk={hunk}
                />
              ))
            }
          </Diff>
        </div>
      )}
    </article>
  );
}
