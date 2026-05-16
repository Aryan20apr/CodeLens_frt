"use client";

import { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import * as Select from "@radix-ui/react-select";
import type { Extension, Range } from "@codemirror/state";
import { Decoration, EditorView, WidgetType } from "@codemirror/view";
import { go } from "@codemirror/lang-go";
import { java } from "@codemirror/lang-java";
import { javascript } from "@codemirror/lang-javascript";
import { StreamLanguage } from "@codemirror/language";
import { php } from "@codemirror/lang-php";
import { python } from "@codemirror/lang-python";
import { rust } from "@codemirror/lang-rust";
import { oneDark } from "@codemirror/theme-one-dark";
import { csharp, kotlin } from "@codemirror/legacy-modes/mode/clike";
import { ruby } from "@codemirror/legacy-modes/mode/ruby";
import { swift } from "@codemirror/legacy-modes/mode/swift";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileCode2,
  Loader2,
  Play,
  RefreshCw,
} from "lucide-react";
import { getAuthSession } from "@/lib/auth/session";
import {
  CodeReviewJobApiError,
  getCodeReviewJobDetails,
  submitCodeReviewJob,
} from "@/lib/code-review/submit-code-review-job";
import type {
  CodeReviewEvent,
  CodeReviewFinding,
  CodeReviewJobCreatedResponse,
  CodeReviewJobDetails,
  CodeReviewReport,
  CodeReviewScore,
} from "@/lib/code-review/types";
import { ScoreBadge } from "@/components/ui/score-badge";

type LanguageId =
  | "typescript"
  | "javascript"
  | "python"
  | "go"
  | "rust"
  | "java"
  | "kotlin"
  | "csharp"
  | "php"
  | "ruby"
  | "swift";

interface LanguageOption {
  id: LanguageId;
  label: string;
  shortLabel: string;
  filename: string;
  starter: string;
}

const LANGUAGES: LanguageOption[] = [
  {
    id: "typescript",
    label: "TypeScript",
    shortLabel: "TS",
    filename: "review.ts",
    starter:
      "type ReviewInput = {\n  code: string;\n};\n\nexport function summarizeReview(input: ReviewInput) {\n  return input.code.trim();\n}\n",
  },
  {
    id: "javascript",
    label: "JavaScript",
    shortLabel: "JS",
    filename: "index.js",
    starter: "function summarizeReview(input) {\n  console.log(\"Hello, world!\");\n  return input;\n}\n",
  },
  {
    id: "python",
    label: "Python",
    shortLabel: "PY",
    filename: "review.py",
    starter: "def summarize_review(code: str) -> str:\n    print(\"Hello, world!\")\n    return code.strip()\n",
  },
  {
    id: "go",
    label: "Go",
    shortLabel: "GO",
    filename: "review.go",
    starter:
      "package main\n\nimport \"fmt\"\n\nfunc summarizeReview(code string) string {\n\tfmt.Println(\"Hello, world!\")\n\treturn code\n}\n",
  },
  {
    id: "rust",
    label: "Rust",
    shortLabel: "RS",
    filename: "review.rs",
    starter: "fn summarize_review(code: &str) -> String {\n    println!(\"Hello, world!\");\n    code.trim().to_string()\n}\n",
  },
  {
    id: "java",
    label: "Java",
    shortLabel: "JAVA",
    filename: "Review.java",
    starter:
      "public final class Review {\n    public static String summarizeReview(String code) {\n        System.out.println(\"Hello, world!\");\n        return code.trim();\n    }\n}\n",
  },
  {
    id: "kotlin",
    label: "Kotlin",
    shortLabel: "KT",
    filename: "Review.kt",
    starter: "fun summarizeReview(code: String): String {\n    println(\"Hello, world!\")\n    return code.trim()\n}\n",
  },
  {
    id: "csharp",
    label: "C#",
    shortLabel: "C#",
    filename: "Review.cs",
    starter:
      "public static class Review\n{\n    public static string SummarizeReview(string code)\n    {\n        System.Console.WriteLine(\"Hello, world!\");\n        return code.Trim();\n    }\n}\n",
  },
  {
    id: "php",
    label: "PHP",
    shortLabel: "PHP",
    filename: "review.php",
    starter: "<?php\n\nfunction summarizeReview(string $code): string\n{\n    echo \"Hello, world!\";\n    return trim($code);\n}\n",
  },
  {
    id: "ruby",
    label: "Ruby",
    shortLabel: "RB",
    filename: "review.rb",
    starter: "def summarize_review(code)\n  puts \"Hello, world!\"\n  code.strip\nend\n",
  },
  {
    id: "swift",
    label: "Swift",
    shortLabel: "SWIFT",
    filename: "Review.swift",
    starter:
      "func summarizeReview(_ code: String) -> String {\n    print(\"Hello, world!\")\n    return code.trimmingCharacters(in: .whitespacesAndNewlines)\n}\n",
  },
];

const languageById = new Map(LANGUAGES.map((language) => [language.id, language]));

function getLanguageExtension(language: LanguageId) {
  if (language === "typescript") return javascript({ jsx: true, typescript: true });
  if (language === "javascript") return javascript({ jsx: true });
  if (language === "python") return python();
  if (language === "go") return go();
  if (language === "rust") return rust();
  if (language === "java") return java();
  if (language === "kotlin") return StreamLanguage.define(kotlin);
  if (language === "csharp") return StreamLanguage.define(csharp);
  if (language === "php") return php();
  if (language === "ruby") return StreamLanguage.define(ruby);
  return StreamLanguage.define(swift);
}

function getSeverityClass(severity: string) {
  if (severity === "critical" || severity === "error") return "cm-review-line-error";
  if (severity === "warning") return "cm-review-line-warning";
  return "cm-review-line-info";
}

function createFindingHighlightExtension(findings: CodeReviewFinding[]): Extension {
  return EditorView.decorations.compute([], (state) => {
    const ranges: Range<Decoration>[] = findings.flatMap((finding) => {
      const startLine = finding.location?.startLine ?? 0;
      const endLine = finding.location?.endLine ?? startLine;
      if (startLine <= 0) return [];

      const lastLine = Math.min(endLine, state.doc.lines);
      const lineRanges: Range<Decoration>[] = [];
      for (let lineNumber = startLine; lineNumber <= lastLine; lineNumber += 1) {
        const line = state.doc.line(lineNumber);
        lineRanges.push(
          Decoration.line({
            class: `cm-review-line ${getSeverityClass(finding.severity)}`,
          }).range(line.from),
        );
      }
      const anchorLine = state.doc.line(lastLine);
      lineRanges.push(
        Decoration.widget({
          widget: new ReviewFindingWidget(finding),
          side: 1,
          block: true,
        }).range(anchorLine.to),
      );
      return lineRanges;
    });

    ranges.sort((a, b) => a.from - b.from || a.to - b.to);
    return Decoration.set(ranges, true);
  });
}

class ReviewFindingWidget extends WidgetType {
  constructor(private readonly finding: CodeReviewFinding) {
    super();
  }

  eq(other: ReviewFindingWidget) {
    return other.finding.id === this.finding.id;
  }

  toDOM() {
    const wrapper = document.createElement("aside");
    wrapper.className = "cm-review-comment";

    const header = document.createElement("div");
    header.className = "cm-review-comment-header";

    const severity = document.createElement("span");
    severity.className = `cm-review-comment-severity ${getSeverityClass(this.finding.severity)}`;
    severity.textContent = this.finding.severity;

    const title = document.createElement("strong");
    title.textContent = this.finding.title;

    const meta = document.createElement("span");
    meta.textContent = formatLabel(this.finding.category);

    header.append(severity, title, meta);

    const description = document.createElement("p");
    description.textContent = this.finding.description;

    wrapper.append(header, description);

    if (this.finding.suggestedFix) {
      const fix = document.createElement("p");
      fix.className = "cm-review-comment-fix";
      fix.textContent = this.finding.suggestedFix;
      wrapper.append(fix);
    }

    return wrapper;
  }

  ignoreEvent() {
    return true;
  }
}

const reviewHighlightTheme = EditorView.theme({
  ".cm-review-line": {
    borderLeft: "3px solid transparent",
  },
  ".cm-review-line-info": {
    backgroundColor: "rgba(192,193,255,0.12)",
    borderLeftColor: "var(--primary)",
  },
  ".cm-review-line-warning": {
    backgroundColor: "rgba(255,183,131,0.14)",
    borderLeftColor: "var(--tertiary)",
  },
  ".cm-review-line-error": {
    backgroundColor: "rgba(255,180,171,0.14)",
    borderLeftColor: "var(--error)",
  },
  ".cm-review-comment": {
    margin: "8px 18px 12px 64px",
    padding: "12px 14px",
    borderRadius: "8px",
    border: "1px solid rgba(70,69,84,0.45)",
    background: "var(--surface-container)",
    boxShadow: "0 10px 24px rgba(0,0,0,0.22)",
    color: "var(--on-surface)",
    fontFamily: "var(--font-space-grotesk)",
  },
  ".cm-review-comment-header": {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
    fontSize: "12px",
    lineHeight: "18px",
  },
  ".cm-review-comment-header strong": {
    fontSize: "13px",
    fontFamily: "var(--font-geist-sans)",
  },
  ".cm-review-comment-header span:last-child": {
    color: "var(--on-surface-variant)",
    textTransform: "capitalize",
  },
  ".cm-review-comment p": {
    margin: "8px 0 0",
    color: "var(--on-surface-variant)",
    fontSize: "13px",
    lineHeight: "20px",
    whiteSpace: "normal",
  },
  ".cm-review-comment .cm-review-comment-fix": {
    color: "var(--on-surface)",
  },
  ".cm-review-comment-severity": {
    borderRadius: "6px",
    padding: "2px 7px",
    fontSize: "11px",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  ".cm-review-comment-severity.cm-review-line-info": {
    background: "rgba(192,193,255,0.12)",
    color: "var(--primary)",
  },
  ".cm-review-comment-severity.cm-review-line-warning": {
    background: "rgba(255,183,131,0.12)",
    color: "var(--tertiary)",
  },
  ".cm-review-comment-severity.cm-review-line-error": {
    background: "rgba(255,180,171,0.12)",
    color: "var(--error)",
  },
});

function getScoreTone(score: number) {
  if (score >= 80) return "var(--primary)";
  if (score >= 60) return "var(--tertiary)";
  return "var(--error)";
}

function formatLabel(value: string) {
  return value.replace(/_/g, " ");
}

function getLatestEvent(events: CodeReviewEvent[]) {
  return events.at(-1);
}

export function CodeReviewWorkspace() {
  const [language, setLanguage] = useState<LanguageId>("javascript");
  const [filename, setFilename] = useState("index.js");
  const [code, setCode] = useState(languageById.get("javascript")?.starter ?? "");
  const [error, setError] = useState<string | null>(null);
  const [createdJob, setCreatedJob] = useState<CodeReviewJobCreatedResponse | null>(null);
  const [jobDetails, setJobDetails] = useState<CodeReviewJobDetails | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const report = jobDetails?.result?.report;
  const findings = report?.findings ?? [];
  const extensions = [
    getLanguageExtension(language),
    createFindingHighlightExtension(findings),
    reviewHighlightTheme,
  ];
  const trimmedCode = code.trim();
  const canSubmit = trimmedCode.length > 0 && filename.trim().length > 0 && !isSubmitting;
  const canRefresh = createdJob?.jobId != null && !isRefreshing && !isSubmitting;

  function handleLanguageChange(nextLanguage: string) {
    const option = languageById.get(nextLanguage as LanguageId);
    if (!option) return;
    setLanguage(option.id);
    setFilename(option.filename);
    setCode(option.starter);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setCreatedJob(null);
    setJobDetails(null);

    const session = getAuthSession();
    if (!session?.accessToken) {
      setError("Your session is missing an access token. Please sign in again.");
      return;
    }

    setIsSubmitting(true);
    void (async () => {
      try {
        const result = await submitCodeReviewJob(
          {
            code: trimmedCode,
            language,
            filename: filename.trim(),
          },
          session.accessToken,
        );
        setCreatedJob(result);
      } catch (err) {
        if (err instanceof CodeReviewJobApiError) {
          setError(err.message);
          return;
        }
        setError("Something went wrong while submitting this review.");
      } finally {
        setIsSubmitting(false);
      }
    })();
  }

  function handleRefreshJob() {
    if (!createdJob?.jobId) return;
    setError(null);

    const session = getAuthSession();
    if (!session?.accessToken) {
      setError("Your session is missing an access token. Please sign in again.");
      return;
    }

    setIsRefreshing(true);
    void (async () => {
      try {
        const result = await getCodeReviewJobDetails(createdJob.jobId, session.accessToken);
        setJobDetails(result);
      } catch (err) {
        if (err instanceof CodeReviewJobApiError) {
          setError(err.message);
          return;
        }
        setError("Something went wrong while refreshing this review.");
      } finally {
        setIsRefreshing(false);
      }
    })();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 pb-8">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-col gap-2">
            <span
              className="text-xs font-semibold uppercase tracking-[0.24em]"
              style={{ color: "var(--primary)", fontFamily: "var(--font-space-grotesk)" }}
            >
              Evaluations
            </span>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1
                  className="text-2xl font-bold"
                  style={{ color: "var(--on-surface)", fontFamily: "var(--font-geist-sans)" }}
                >
                  Review a code snippet
                </h1>
                <p
                  className="mt-1 max-w-2xl text-sm"
                  style={{
                    color: "var(--on-surface-variant)",
                    fontFamily: "var(--font-space-grotesk)",
                  }}
                >
                  Submit a focused snippet to the CodeLens review pipeline.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleRefreshJob}
                  disabled={!canRefresh}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-45"
                  style={{
                    background: "var(--surface-high)",
                    border: "1px solid rgba(70,69,84,0.45)",
                    color: "var(--on-surface)",
                    fontFamily: "var(--font-space-grotesk)",
                  }}
                >
                  {isRefreshing ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <RefreshCw className="h-4 w-4" aria-hidden />
                  )}
                  Refresh
                </button>
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="btn-primary inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold disabled:pointer-events-none disabled:opacity-50"
                  style={{ fontFamily: "var(--font-space-grotesk)" }}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <Play className="h-4 w-4" fill="currentColor" aria-hidden />
                  )}
                  {isSubmitting ? "Submitting" : "Review Code"}
                </button>
              </div>
            </div>
          </div>

          <div
            className="overflow-hidden rounded-2xl"
            style={{ background: "var(--surface-container)", boxShadow: "var(--shadow-card)" }}
          >
            <div
              className="grid gap-3 px-4 py-4 lg:grid-cols-[220px_minmax(0,1fr)]"
              style={{ borderBottom: "1px solid rgba(70,69,84,0.25)" }}
            >
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="language"
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{
                    color: "var(--on-surface-variant)",
                    fontFamily: "var(--font-space-grotesk)",
                  }}
                >
                  Language
                </label>
                <Select.Root value={language} onValueChange={handleLanguageChange}>
                  <Select.Trigger
                    id="language"
                    className="flex h-10 items-center justify-between rounded-lg px-3 text-sm outline-none transition-colors"
                    style={{
                      background: "var(--surface-high)",
                      border: "1px solid rgba(70,69,84,0.4)",
                      color: "var(--on-surface)",
                      fontFamily: "var(--font-space-grotesk)",
                    }}
                    aria-label="Language"
                  >
                    <Select.Value />
                    <Select.Icon>
                      <ChevronDown className="h-4 w-4" aria-hidden />
                    </Select.Icon>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content
                      position="popper"
                      sideOffset={6}
                      className="z-50 overflow-hidden rounded-lg"
                      style={{
                        background: "var(--surface-high)",
                        border: "1px solid rgba(70,69,84,0.7)",
                        boxShadow: "var(--shadow-float)",
                      }}
                    >
                      <Select.Viewport className="p-1">
                        {LANGUAGES.map((option) => (
                          <Select.Item
                            key={option.id}
                            value={option.id}
                            className="flex cursor-pointer select-none items-center gap-2 rounded-md px-3 py-2 text-sm outline-none data-[highlighted]:bg-[var(--surface-highest)]"
                            style={{
                              color: "var(--on-surface)",
                              fontFamily: "var(--font-space-grotesk)",
                            }}
                          >
                            <span
                              className="rounded px-1.5 py-0.5 text-[10px] font-bold"
                              style={{
                                background: "rgba(192,193,255,0.12)",
                                color: "var(--primary)",
                              }}
                            >
                              {option.shortLabel}
                            </span>
                            <Select.ItemText>{option.label}</Select.ItemText>
                            <Select.ItemIndicator className="ml-auto">
                              <Check className="h-3.5 w-3.5" aria-hidden />
                            </Select.ItemIndicator>
                          </Select.Item>
                        ))}
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="filename"
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{
                    color: "var(--on-surface-variant)",
                    fontFamily: "var(--font-space-grotesk)",
                  }}
                >
                  Filename
                </label>
                <div
                  className="flex h-10 items-center gap-2 rounded-lg px-3"
                  style={{
                    background: "var(--surface-high)",
                    border: "1px solid rgba(70,69,84,0.4)",
                  }}
                >
                  <FileCode2 className="h-4 w-4 shrink-0" style={{ color: "var(--primary)" }} aria-hidden />
                  <input
                    id="filename"
                    value={filename}
                    onChange={(event) => setFilename(event.currentTarget.value)}
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                    style={{
                      color: "var(--on-surface)",
                      fontFamily: "var(--font-geist-mono)",
                    }}
                  />
                </div>
              </div>
            </div>

            <div>
              <CodeMirror
                value={code}
                height="520px"
                extensions={extensions}
                basicSetup={{
                  autocompletion: true,
                  bracketMatching: true,
                  closeBrackets: true,
                  foldGutter: true,
                  highlightActiveLine: true,
                  highlightActiveLineGutter: true,
                  lineNumbers: true,
                }}
                onChange={setCode}
                theme={oneDark}
                className="text-sm"
              />
            </div>
          </div>
        </div>

        <aside className="flex flex-col gap-4">
          <JobStatusCard createdJob={createdJob} jobDetails={jobDetails} isRefreshing={isRefreshing} />

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

          <ReviewReportPanel jobDetails={jobDetails} report={report} />
        </aside>
      </section>
    </form>
  );
}

function JobStatusCard({
  createdJob,
  jobDetails,
  isRefreshing,
}: {
  createdJob: CodeReviewJobCreatedResponse | null;
  jobDetails: CodeReviewJobDetails | null;
  isRefreshing: boolean;
}) {
  const progressPct = Math.round((jobDetails?.progress?.pct ?? 0) * 100);
  const state = jobDetails?.state ?? (createdJob ? "created" : "idle");
  const latestEvent = getLatestEvent(jobDetails?.result?.events ?? []);
  const isComplete = state === "completed" || jobDetails?.result?.status === "complete";

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "var(--surface-container)", boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2
            className="text-sm font-semibold"
            style={{ color: "var(--on-surface)", fontFamily: "var(--font-geist-sans)" }}
          >
            Review job
          </h2>
          <p
            className="mt-1 text-xs"
            style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}
          >
            {createdJob ? `Job ${createdJob.jobId}` : "Submit code to create a job"}
          </p>
        </div>
        <span
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold capitalize"
          style={{
            background: isComplete ? "rgba(192,193,255,0.12)" : "rgba(255,183,131,0.12)",
            color: isComplete ? "var(--primary)" : "var(--tertiary)",
            fontFamily: "var(--font-space-grotesk)",
          }}
        >
          {isComplete ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> : <Clock3 className="h-3.5 w-3.5" aria-hidden />}
          {isRefreshing ? "refreshing" : state}
        </span>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        <div
          className="h-2 overflow-hidden rounded-full"
          style={{ background: "var(--surface-highest)" }}
          aria-hidden
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.max(progressPct, createdJob && !jobDetails ? 8 : 0)}%`,
              background: isComplete ? "var(--primary)" : "var(--tertiary)",
            }}
          />
        </div>
        <div
          className="flex items-center justify-between gap-3 text-xs"
          style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}
        >
          <span className="min-w-0 truncate">{jobDetails?.progress?.step ?? latestEvent?.message ?? "Waiting for refresh"}</span>
          <span className="shrink-0 tabular-nums">{progressPct}%</span>
        </div>
      </div>
    </div>
  );
}

function ReviewReportPanel({
  jobDetails,
  report,
}: {
  jobDetails: CodeReviewJobDetails | null;
  report?: CodeReviewReport;
}) {
  if (!jobDetails) {
    return (
      <EmptyPanel title="Review report" body="Create a job, then refresh to load progress and results." />
    );
  }

  if (!report) {
    return (
      <div
        className="rounded-2xl p-5"
        style={{ background: "var(--surface-lowest)", boxShadow: "var(--shadow-card)" }}
      >
        <h2
          className="text-sm font-semibold"
          style={{ color: "var(--on-surface)", fontFamily: "var(--font-geist-sans)" }}
        >
          Review progress
        </h2>
        <EventTimeline events={jobDetails.result?.events ?? []} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <ScorePanel score={report.score} />
      <ReportSummary report={report} />
      <EventPanel events={jobDetails.result?.events ?? []} />
    </div>
  );
}

function EmptyPanel({ title, body }: { title: string; body: string }) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "var(--surface-lowest)", boxShadow: "var(--shadow-card)" }}
    >
      <h2
        className="text-sm font-semibold"
        style={{ color: "var(--on-surface)", fontFamily: "var(--font-geist-sans)" }}
      >
        {title}
      </h2>
      <p
        className="mt-3 text-sm leading-6"
        style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}
      >
        {body}
      </p>
    </div>
  );
}

function ScorePanel({ score }: { score: CodeReviewScore }) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "var(--surface-container)", boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex items-center gap-4">
        <ScoreBadge score={score.overall} size="md" showBloom />
        <div>
          <h2
            className="text-sm font-semibold"
            style={{ color: "var(--on-surface)", fontFamily: "var(--font-geist-sans)" }}
          >
            Overall score
          </h2>
          <p
            className="mt-1 text-xs"
            style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}
          >
            Weighted from category-level review signals.
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        {Object.entries(score.categories).map(([category, value]) => (
          <div key={category} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-3">
              <span
                className="text-xs font-semibold capitalize"
                style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}
              >
                {formatLabel(category)}
              </span>
              <span
                className="text-xs font-bold tabular-nums"
                style={{ color: getScoreTone(value), fontFamily: "var(--font-space-grotesk)" }}
              >
                {value}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full" style={{ background: "var(--surface-highest)" }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${value}%`, background: getScoreTone(value) }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportSummary({ report }: { report: CodeReviewReport }) {
  const metadata = report.metadata;

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "var(--surface-lowest)", boxShadow: "var(--shadow-card)" }}
    >
      <h2
        className="text-sm font-semibold"
        style={{ color: "var(--on-surface)", fontFamily: "var(--font-geist-sans)" }}
      >
        Summary
      </h2>
      <p
        className="mt-3 text-sm leading-6"
        style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}
      >
        {report.summary}
      </p>

      {metadata && (
        <div className="mt-5 grid grid-cols-2 gap-2">
          <Metric label="LOC" value={metadata.linesOfCode} />
          <Metric label="Functions" value={metadata.functionCount} />
          <Metric label="Classes" value={metadata.classCount} />
          <Metric label="Imports" value={metadata.importCount} />
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value?: number }) {
  return (
    <div
      className="rounded-lg p-3"
      style={{ background: "var(--surface-container)", border: "1px solid rgba(70,69,84,0.28)" }}
    >
      <span
        className="block text-[11px] font-semibold uppercase tracking-wider"
        style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}
      >
        {label}
      </span>
      <span
        className="mt-1 block text-lg font-bold tabular-nums"
        style={{ color: "var(--on-surface)", fontFamily: "var(--font-geist-sans)" }}
      >
        {value ?? "-"}
      </span>
    </div>
  );
}

function EventPanel({ events }: { events: CodeReviewEvent[] }) {
  if (events.length === 0) return null;

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "var(--surface-lowest)", boxShadow: "var(--shadow-card)" }}
    >
      <h2
        className="text-sm font-semibold"
        style={{ color: "var(--on-surface)", fontFamily: "var(--font-geist-sans)" }}
      >
        Events
      </h2>
      <EventTimeline events={events} />
    </div>
  );
}

function EventTimeline({ events }: { events: CodeReviewEvent[] }) {
  if (events.length === 0) {
    return (
      <p
        className="mt-3 text-sm"
        style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}
      >
        No events have been returned yet.
      </p>
    );
  }

  return (
    <ol className="mt-4 flex max-h-72 flex-col gap-3 overflow-auto pr-1">
      {events.map((event, index) => (
        <li key={`${event.node}-${event.status}-${event.at ?? index}`} className="flex gap-3">
          <span
            className="mt-1 h-2 w-2 shrink-0 rounded-full"
            style={{ background: event.status === "started" ? "var(--tertiary)" : "var(--primary)" }}
            aria-hidden
          />
          <div className="min-w-0">
            <p
              className="truncate text-xs font-semibold"
              style={{ color: "var(--on-surface)", fontFamily: "var(--font-space-grotesk)" }}
            >
              {event.message ?? event.node}
            </p>
            <p
              className="mt-0.5 text-[11px]"
              style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-geist-mono)" }}
            >
              {event.node} / {event.status}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
