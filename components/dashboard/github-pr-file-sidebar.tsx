"use client";

import { FileCode2, FileMinus2, FilePlus2, FilePenLine } from "lucide-react";
import type { GithubPullRequestFile } from "@/lib/github/types";

function fileKey(file: GithubPullRequestFile): string {
  return `${file.filename}:${file.previousFilename ?? ""}`;
}

function getDisplayName(file: GithubPullRequestFile): string {
  if (file.status === "renamed" && file.previousFilename) {
    return `${file.previousFilename} → ${file.filename}`;
  }
  return file.filename;
}

function StatusIcon({ status }: { status: GithubPullRequestFile["status"] }) {
  const props = { size: 14, "aria-hidden": true as const };
  switch (status) {
    case "added":
      return <FilePlus2 {...props} style={{ color: "var(--primary)" }} />;
    case "removed":
      return <FileMinus2 {...props} style={{ color: "var(--error)" }} />;
    case "renamed":
      return <FilePenLine {...props} style={{ color: "var(--tertiary)" }} />;
    default:
      return <FileCode2 {...props} style={{ color: "var(--on-surface-variant)" }} />;
  }
}

interface GithubPrFileSidebarProps {
  files: GithubPullRequestFile[];
  selectedKey: string | null;
  onSelect: (key: string) => void;
}

export function GithubPrFileSidebar({ files, selectedKey, onSelect }: GithubPrFileSidebarProps) {
  return (
    <aside
      className="flex w-72 shrink-0 flex-col overflow-hidden"
      style={{
        background: "var(--surface-low)",
        borderRight: "1px solid rgba(70,69,84,0.2)",
      }}
    >
      <div
        className="px-4 py-3 text-xs font-semibold uppercase tracking-wider"
        style={{
          color: "var(--on-surface-variant)",
          fontFamily: "var(--font-space-grotesk)",
          borderBottom: "1px solid rgba(70,69,84,0.12)",
        }}
      >
        Changed files ({files.length})
      </div>
      <nav className="flex-1 overflow-y-auto py-1" aria-label="Changed files">
        {files.map((file) => {
          const key = fileKey(file);
          const isSelected = selectedKey === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(key)}
              className="flex w-full items-start gap-2 px-3 py-2.5 text-left transition-colors"
              style={{
                background: isSelected ? "var(--surface-container)" : "transparent",
                borderLeft: isSelected
                  ? "2px solid var(--primary)"
                  : "2px solid transparent",
              }}
            >
              <span className="mt-0.5 shrink-0">
                <StatusIcon status={file.status} />
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className="block truncate text-sm font-medium"
                  style={{
                    color: isSelected ? "var(--on-surface)" : "var(--on-surface-variant)",
                    fontFamily: "var(--font-geist-mono)",
                  }}
                  title={getDisplayName(file)}
                >
                  {file.filename}
                </span>
                <span
                  className="mt-0.5 flex gap-2 text-xs font-semibold"
                  style={{ fontFamily: "var(--font-space-grotesk)" }}
                >
                  <span style={{ color: "var(--primary)" }}>+{file.additions}</span>
                  <span style={{ color: "var(--error)" }}>−{file.deletions}</span>
                </span>
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

export { fileKey as pullRequestFileKey };
