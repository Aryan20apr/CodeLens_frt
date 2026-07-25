export type ReviewRunStreamEventKind = "snapshot" | "step" | "done";

export type ReviewRunLifecycleStatus = "RUNNING" | "COMPLETED" | "FAILED" | string;

export type ReviewRunStepPhase = "started" | "completed" | "failed" | string;

export interface ReviewRunSnapshotPayload {
  id: string;
  repoFullName: string;
  prNumber: number;
  headSha?: string;
  baseSha?: string;
  status: ReviewRunLifecycleStatus;
  triggeredBy?: string;
  summaryText?: string | null;
  githubReviewId?: number | null;
  error?: string | null;
  currentStep?: string | null;
  currentStepMessage?: string | null;
  createdAt?: string;
  completedAt?: string | null;
}

export interface ReviewRunStepPayload {
  type: "step";
  reviewRunId: string;
  step: string;
  status: ReviewRunStepPhase;
  meta?: Record<string, unknown>;
  at: string;
}

export interface ReviewRunDonePayload {
  type: "done";
  reviewRunId: string;
  status: "COMPLETED" | "FAILED" | string;
  at: string;
}

export type ReviewRunStreamEvent =
  | { kind: "snapshot"; data: ReviewRunSnapshotPayload }
  | { kind: "step"; data: ReviewRunStepPayload }
  | { kind: "done"; data: ReviewRunDonePayload };

export type WorkflowStepStatus = "pending" | "running" | "completed" | "failed";

export interface ReviewRunWorkflowStep {
  id: string;
  label: string;
  status: WorkflowStepStatus;
  meta?: Record<string, unknown>;
  startedAt?: string;
  completedAt?: string;
}

export type ReviewRunWorkflowRunStatus = "idle" | "running" | "completed" | "failed";

export interface ReviewRunWorkflowState {
  runId: string | null;
  repoFullName: string | null;
  prNumber: number | null;
  runStatus: ReviewRunWorkflowRunStatus;
  runError: string | null;
  currentStepMessage: string | null;
  steps: ReviewRunWorkflowStep[];
  completedAt: string | null;
}

export const INITIAL_REVIEW_RUN_WORKFLOW_STATE: ReviewRunWorkflowState = {
  runId: null,
  repoFullName: null,
  prNumber: null,
  runStatus: "idle",
  runError: null,
  currentStepMessage: null,
  steps: [],
  completedAt: null,
};
