"use client";

import { useCallback, useRef, useState, useSyncExternalStore } from "react";
import {
  ChevronLeft,
  ChevronRight,
  FileCode2,
  FileMinus2,
  FilePenLine,
  FilePlus2,
} from "lucide-react";
import type { GithubPullRequestFile } from "@/lib/github/types";
import {
  PR_FILE_SIDEBAR_COLLAPSED_WIDTH,
  PR_FILE_SIDEBAR_DEFAULT_WIDTH,
  clampPrFileSidebarWidth,
  readPrFileSidebarPrefs,
  subscribePrFileSidebarPrefs,
  getPrFileSidebarServerPrefs,
  writePrFileSidebarPrefs,
} from "@/lib/github/pr-file-sidebar-prefs";

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
  const storedPrefs = useSyncExternalStore(
    subscribePrFileSidebarPrefs,
    readPrFileSidebarPrefs,
    getPrFileSidebarServerPrefs,
  );
  const [resizeWidth, setResizeWidth] = useState<number | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const resizeWidthRef = useRef(storedPrefs.width);

  const collapsed = storedPrefs.collapsed;
  const width = resizeWidth ?? storedPrefs.width;
  const asideWidth = collapsed ? PR_FILE_SIDEBAR_COLLAPSED_WIDTH : width;

  const toggleCollapsed = useCallback(() => {
    writePrFileSidebarPrefs({
      width: storedPrefs.width,
      collapsed: !storedPrefs.collapsed,
    });
  }, [storedPrefs.width, storedPrefs.collapsed]);

  const persistWidth = useCallback((nextWidth: number) => {
    const clamped = clampPrFileSidebarWidth(nextWidth);
    writePrFileSidebarPrefs({ ...readPrFileSidebarPrefs(), width: clamped });
    return clamped;
  }, []);

  const startResize = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      const startX = event.clientX;
      const startWidth = width;

      setIsResizing(true);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";

      const onMove = (moveEvent: MouseEvent) => {
        const next = clampPrFileSidebarWidth(startWidth + (moveEvent.clientX - startX));
        resizeWidthRef.current = next;
        setResizeWidth(next);
      };

      const onUp = () => {
        setIsResizing(false);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
        persistWidth(resizeWidthRef.current);
        setResizeWidth(null);
      };

      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [persistWidth, width],
  );

  return (
    <aside
      className="relative flex shrink-0 flex-col overflow-hidden"
      style={{
        width: asideWidth,
        background: "var(--surface-low)",
        borderRight: "1px solid rgba(70,69,84,0.2)",
        transition: isResizing ? "none" : "width 0.2s ease",
      }}
    >
      <div
        className="flex shrink-0 items-center gap-1 border-b px-2 py-2"
        style={{
          borderColor: "rgba(70,69,84,0.12)",
          minHeight: "2.75rem",
        }}
      >
        <button
          type="button"
          onClick={toggleCollapsed}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors hover:opacity-90"
          style={{ color: "var(--on-surface-variant)" }}
          title={collapsed ? "Expand file list" : "Collapse file list"}
          aria-label={collapsed ? "Expand file list" : "Collapse file list"}
          aria-expanded={!collapsed}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
        {!collapsed && (
          <span
            className="min-w-0 flex-1 truncate px-1 text-xs font-semibold uppercase tracking-wider"
            style={{
              color: "var(--on-surface-variant)",
              fontFamily: "var(--font-space-grotesk)",
            }}
          >
            Changed files ({files.length})
          </span>
        )}
      </div>

      {collapsed ? (
        <div className="flex flex-1 flex-col items-center gap-2 py-3">
          <span
            className="text-[10px] font-bold tabular-nums"
            style={{
              color: "var(--primary)",
              fontFamily: "var(--font-space-grotesk)",
              writingMode: "vertical-rl",
              textOrientation: "mixed",
            }}
            title={`${files.length} changed files`}
          >
            {files.length} files
          </span>
        </div>
      ) : (
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
      )}

      {!collapsed && (
        <button
          type="button"
          aria-label="Resize file list"
          onMouseDown={startResize}
          onDoubleClick={() => {
            persistWidth(PR_FILE_SIDEBAR_DEFAULT_WIDTH);
            setResizeWidth(null);
          }}
          className="group/resize absolute top-0 right-0 z-10 flex h-full w-2.5 cursor-col-resize items-center justify-center border-0 bg-transparent p-0"
          style={{ touchAction: "none" }}
          title="Drag to resize · double-click to reset"
        >
          <span
            className="h-10 w-1 rounded-full transition-colors group-hover/resize:bg-[var(--outline)]"
            style={{
              background: isResizing ? "var(--primary)" : "rgba(70,69,84,0.35)",
            }}
          />
        </button>
      )}
    </aside>
  );
}

export { fileKey as pullRequestFileKey };
