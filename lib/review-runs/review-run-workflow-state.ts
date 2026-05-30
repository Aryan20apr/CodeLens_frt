import type {
  ReviewRunStreamEvent,
  ReviewRunWorkflowState,
  ReviewRunWorkflowStep,
  WorkflowStepStatus,
} from "@/lib/review-runs/review-run-stream-types";

const STEP_LABELS: Record<string, string> = {
  fetching_diff: "Fetch pull request diff",
  parsing_diff: "Parse changed files",
  chunking: "Prepare code chunks",
  summarizing: "Analyze with AI",
  posting_review: "Post review to GitHub",
};

export function formatReviewRunStepLabel(stepId: string): string {
  if (STEP_LABELS[stepId]) return STEP_LABELS[stepId];
  return stepId
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function lifecycleToRunStatus(
  status: string,
): ReviewRunWorkflowState["runStatus"] {
  const upper = status.toUpperCase();
  if (upper === "COMPLETED") return "completed";
  if (upper === "FAILED") return "failed";
  if (upper === "RUNNING") return "running";
  return "running";
}

function stepPhaseToStatus(phase: string): WorkflowStepStatus {
  if (phase === "completed") return "completed";
  if (phase === "failed") return "failed";
  if (phase === "started") return "running";
  return "pending";
}

function upsertStep(
  steps: ReviewRunWorkflowStep[],
  stepId: string,
  patch: Partial<ReviewRunWorkflowStep>,
): ReviewRunWorkflowStep[] {
  const index = steps.findIndex((step) => step.id === stepId);
  const label = formatReviewRunStepLabel(stepId);

  if (index === -1) {
    return [
      ...steps,
      {
        id: stepId,
        label,
        status: "pending",
        ...patch,
      },
    ];
  }

  const next = [...steps];
  next[index] = { ...next[index], ...patch, label };
  return next;
}

function applySnapshot(
  state: ReviewRunWorkflowState,
  event: Extract<ReviewRunStreamEvent, { kind: "snapshot" }>,
): ReviewRunWorkflowState {
  const { data } = event;
  let next: ReviewRunWorkflowState = {
    ...state,
    runId: data.id,
    repoFullName: data.repoFullName,
    prNumber: data.prNumber,
    runStatus: lifecycleToRunStatus(data.status),
    runError: data.error ?? null,
    currentStepMessage: data.currentStepMessage ?? null,
    completedAt: data.completedAt ?? state.completedAt,
  };

  if (data.currentStep) {
    next = {
      ...next,
      steps: upsertStep(next.steps, data.currentStep, {
        status: "running",
      }),
    };
  }

  return next;
}

function applyStep(
  state: ReviewRunWorkflowState,
  event: Extract<ReviewRunStreamEvent, { kind: "step" }>,
): ReviewRunWorkflowState {
  const { data } = event;
  const status = stepPhaseToStatus(data.status);
  const patch: Partial<ReviewRunWorkflowStep> = {
    status,
    meta: data.meta ?? undefined,
  };

  if (data.status === "started") {
    patch.startedAt = data.at;
  }
  if (data.status === "completed" || data.status === "failed") {
    patch.completedAt = data.at;
  }

  return {
    ...state,
    runStatus: state.runStatus === "idle" ? "running" : state.runStatus,
    steps: upsertStep(state.steps, data.step, patch),
  };
}

function applyDone(
  state: ReviewRunWorkflowState,
  event: Extract<ReviewRunStreamEvent, { kind: "done" }>,
): ReviewRunWorkflowState {
  const terminal = lifecycleToRunStatus(event.data.status);
  const steps = state.steps.map((step) => {
    if (step.status === "running") {
      return {
        ...step,
        status: terminal === "failed" ? ("failed" as const) : ("completed" as const),
        completedAt: step.completedAt ?? event.data.at,
      };
    }
    return step;
  });

  return {
    ...state,
    runStatus: terminal === "failed" ? "failed" : "completed",
    steps,
    completedAt: event.data.at,
  };
}

export function applyReviewRunStreamEvent(
  state: ReviewRunWorkflowState,
  event: ReviewRunStreamEvent,
): ReviewRunWorkflowState {
  switch (event.kind) {
    case "snapshot":
      return applySnapshot(state, event);
    case "step":
      return applyStep(state, event);
    case "done":
      return applyDone(state, event);
    default:
      return state;
  }
}

export function applyReviewRunStreamEvents(
  state: ReviewRunWorkflowState,
  events: ReviewRunStreamEvent[],
): ReviewRunWorkflowState {
  return events.reduce(applyReviewRunStreamEvent, state);
}

export function getWorkflowProgress(state: ReviewRunWorkflowState): number {
  if (state.steps.length === 0) {
    if (state.runStatus === "completed") return 100;
    if (state.runStatus === "running") return 8;
    return 0;
  }

  const completed = state.steps.filter((step) => step.status === "completed").length;
  const running = state.steps.some((step) => step.status === "running") ? 0.35 : 0;
  return Math.min(100, Math.round(((completed + running) / state.steps.length) * 100));
}
