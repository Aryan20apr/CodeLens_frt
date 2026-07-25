"use client";

import { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Circle,
  Loader2,
  XCircle,
} from "lucide-react";
import { getWorkflowProgress } from "@/lib/review-runs/review-run-workflow-state";
import type {
  ReviewRunWorkflowState,
  ReviewRunWorkflowStep,
  WorkflowStepStatus,
} from "@/lib/review-runs/review-run-stream-types";
import "./review-run-workflow.css";

interface ReviewRunWorkflowProps {
  state: ReviewRunWorkflowState;
  isStreaming: boolean;
  streamError?: string | null;
}

interface ActiveStepSummary {
  label: string;
  status: WorkflowStepStatus;
}

function formatMeta(meta: Record<string, unknown> | undefined): string[] {
  if (!meta) return [];
  const chips: string[] = [];
  if (typeof meta.fileCount === "number") {
    chips.push(`${meta.fileCount} file${meta.fileCount === 1 ? "" : "s"}`);
  }
  if (typeof meta.chunkCount === "number") {
    chips.push(`${meta.chunkCount} chunk${meta.chunkCount === 1 ? "" : "s"}`);
  }
  for (const [key, value] of Object.entries(meta)) {
    if (key === "fileCount" || key === "chunkCount") continue;
    if (value === null || value === undefined) continue;
    chips.push(`${key}: ${String(value)}`);
  }
  return chips;
}

function getActiveStepSummary(
  state: ReviewRunWorkflowState,
  isStreaming: boolean,
  streamError: string | null | undefined,
): ActiveStepSummary {
  if (state.runStatus === "failed") {
    return {
      label: state.runError ?? streamError ?? "Review failed",
      status: "failed",
    };
  }

  if (state.runStatus === "completed") {
    return {
      label: "Review posted to GitHub",
      status: "completed",
    };
  }

  const runningStep = state.steps.find((step) => step.status === "running");
  if (runningStep) {
    return { label: runningStep.label, status: "running" };
  }

  if (state.currentStepMessage) {
    return { label: state.currentStepMessage, status: isStreaming ? "running" : "pending" };
  }

  if (isStreaming && state.steps.length === 0) {
    return { label: "Connecting…", status: "running" };
  }

  const lastStep = state.steps[state.steps.length - 1];
  if (lastStep) {
    return { label: lastStep.label, status: lastStep.status };
  }

  return { label: "Starting review…", status: "pending" };
}

function StepIcon({ status }: { status: WorkflowStepStatus }) {
  if (status === "completed") {
    return <CheckCircle2 className="review-step-icon review-step-icon--completed" aria-hidden />;
  }
  if (status === "failed") {
    return <XCircle className="review-step-icon review-step-icon--failed" aria-hidden />;
  }
  if (status === "running") {
    return <Loader2 className="review-step-icon review-step-icon--running animate-spin" aria-hidden />;
  }
  return <Circle className="review-step-icon review-step-icon--pending" aria-hidden />;
}

function WorkflowStepRow({ step, isLast }: { step: ReviewRunWorkflowStep; isLast: boolean }) {
  const metaChips = formatMeta(step.meta);

  return (
    <li
      className={`review-step-row review-step-row--${step.status}${isLast ? " review-step-row--last" : ""}`}
    >
      <div className="review-step-rail" aria-hidden>
        <StepIcon status={step.status} />
        {!isLast && <span className="review-step-connector" />}
      </div>
      <div className="review-step-body">
        <p className="review-step-label">{step.label}</p>
        {metaChips.length > 0 && (
          <div className="review-step-meta">
            {metaChips.map((chip) => (
              <span key={chip} className="review-step-chip">
                {chip}
              </span>
            ))}
          </div>
        )}
      </div>
    </li>
  );
}

export function ReviewRunWorkflow({ state, isStreaming, streamError }: ReviewRunWorkflowProps) {
  const [expanded, setExpanded] = useState(false);
  const progress = getWorkflowProgress(state);
  const activeStep = getActiveStepSummary(state, isStreaming, streamError);

  const showPanel =
    isStreaming ||
    state.runStatus !== "idle" ||
    state.steps.length > 0 ||
    Boolean(streamError);

  if (!showPanel) return null;

  const detailsId = "review-workflow-details";
  const hasSteps = state.steps.length > 0;
  const canExpand = hasSteps || isStreaming || Boolean(streamError);

  return (
    <section
      className={`review-timeline${expanded ? " review-timeline--expanded" : ""}`}
      aria-live="polite"
      aria-label="Review progress"
    >
      <button
        type="button"
        className="review-timeline-bar"
        onClick={() => canExpand && setExpanded((open) => !open)}
        aria-expanded={expanded}
        aria-controls={detailsId}
        disabled={!canExpand}
      >
        <StepIcon status={activeStep.status} />
        <span className="review-timeline-current">{activeStep.label}</span>
        {(isStreaming || state.runStatus === "running") && (
          <span className="review-timeline-progress">{progress}%</span>
        )}
        {canExpand && (
          <ChevronDown
            className={`review-timeline-chevron${expanded ? " review-timeline-chevron--open" : ""}`}
            aria-hidden
          />
        )}
      </button>

      {expanded && (
        <div id={detailsId} className="review-timeline-details">
          {hasSteps ? (
            <ol className="review-step-list">
              {state.steps.map((step, index) => (
                <WorkflowStepRow
                  key={step.id}
                  step={step}
                  isLast={index === state.steps.length - 1}
                />
              ))}
            </ol>
          ) : isStreaming ? (
            <p className="review-timeline-waiting">
              <Loader2 className="inline h-3.5 w-3.5 animate-spin" aria-hidden /> Connecting…
            </p>
          ) : null}

          {state.runStatus === "failed" && (state.runError || streamError) && (
            <p className="review-timeline-note review-timeline-note--error" role="alert">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {state.runError ?? streamError}
            </p>
          )}

          {streamError && state.runStatus !== "failed" && (
            <p className="review-timeline-note review-timeline-note--error" role="alert">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {streamError}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
