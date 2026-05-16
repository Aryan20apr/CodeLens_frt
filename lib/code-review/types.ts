export interface CodeReviewJobRequest {
  code: string;
  language: string;
  filename: string;
}

export interface CodeReviewJobCreatedResponse {
  jobId: string;
  threadId: string;
}

export interface CodeReviewProgress {
  step: string;
  pct: number;
}

export type CodeReviewSeverity = "info" | "warning" | "error" | "critical" | string;

export interface CodeReviewFinding {
  id: string;
  category: string;
  severity: CodeReviewSeverity;
  title: string;
  description: string;
  location?: {
    startLine?: number;
    endLine?: number;
  };
  evidenceSnippet?: string;
  suggestedFix?: string;
  confidence?: string;
}

export interface CodeReviewScore {
  overall: number;
  categories: Record<string, number>;
}

export interface CodeReviewReport {
  summary: string;
  score: CodeReviewScore;
  findings: CodeReviewFinding[];
  metadata?: {
    linesOfCode?: number;
    functionCount?: number;
    classCount?: number;
    importCount?: number;
    functions?: Array<{ name: string; startLine?: number; endLine?: number }>;
    classes?: unknown[];
    imports?: unknown[];
    entryPoints?: unknown[];
    maxCyclomaticComplexity?: number | null;
    averageCyclomaticComplexity?: number | null;
  };
  language: string;
}

export interface CodeReviewEvent {
  node: string;
  status: string;
  message?: string;
  at?: string;
}

export interface CodeReviewJobDetails {
  jobId: string;
  state: string;
  progress?: CodeReviewProgress;
  result?: {
    threadId?: string;
    status?: string;
    error?: string | null;
    report?: CodeReviewReport;
    score?: CodeReviewScore;
    events?: CodeReviewEvent[];
  };
}
