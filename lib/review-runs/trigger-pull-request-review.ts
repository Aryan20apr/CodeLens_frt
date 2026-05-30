import { apiBaseUrl } from "@/lib/api-config";
import { authFetch } from "@/lib/auth/auth-fetch";
import { normalizeRepoId } from "@/lib/github/repo-id";

export class ReviewRunApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(message);
    this.name = "ReviewRunApiError";
  }
}

function getErrorMessage(data: unknown): string {
  if (data && typeof data === "object" && "message" in data) {
    const message = (data as { message?: unknown }).message;
    if (typeof message === "string" && message.trim().length > 0) return message;
  }
  return "Could not start pull request review";
}

function isReviewRunCreated(data: unknown): boolean {
  return (
    !!data &&
    typeof data === "object" &&
    typeof (data as { reviewRunId?: unknown }).reviewRunId === "string" &&
    (data as { reviewRunId: string }).reviewRunId.trim().length > 0
  );
}

export async function triggerPullRequestReview(
  accessToken: string,
  repoId: string | number,
  pullNumber: number,
): Promise<void> {
  const repoIdParam = normalizeRepoId(repoId);

  const res = await authFetch(
    `${apiBaseUrl}/api/v1/review-runs/repositories/${encodeURIComponent(repoIdParam)}/pull-requests/${pullNumber}`,
    {
      method: "POST",
      headers: { Accept: "application/json" },
    },
    { accessToken },
  );

  const data: unknown = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ReviewRunApiError(getErrorMessage(data), res.status, data);
  }

  if (!isReviewRunCreated(data)) {
    throw new ReviewRunApiError("Review run response was invalid", res.status, data);
  }
}
