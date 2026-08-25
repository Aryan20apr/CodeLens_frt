export type ReviewRunStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
export type ReviewRunTrigger = "WEBHOOK" | "MANUAL";

export interface ReviewRun {
  id: string;
  repoFullName: string;
  prNumber: number;
  headSha: string;
  baseSha: string;
  status: ReviewRunStatus;
  triggeredBy: ReviewRunTrigger;
  summaryText: string | null;
  githubReviewId: string | null;
  error: string | null;
  currentStep: string | null;
  currentStepMessage: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface ReviewRunList {
  items: ReviewRun[];
  total: number;
  page: number;
  perPage: number;
}
