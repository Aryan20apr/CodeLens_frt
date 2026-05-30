import { apiBaseUrl } from "@/lib/api-config";
import { authFetch } from "@/lib/auth/auth-fetch";
import { normalizeRepoId } from "@/lib/github/repo-id";
import { getReviewRunErrorMessage, ReviewRunApiError } from "@/lib/review-runs/review-run-api-error";

export { ReviewRunApiError } from "@/lib/review-runs/review-run-api-error";

function parseReviewRunId(data: unknown): string | null {
  if (
    data &&
    typeof data === "object" &&
    typeof (data as { reviewRunId?: unknown }).reviewRunId === "string"
  ) {
    const id = (data as { reviewRunId: string }).reviewRunId.trim();
    return id.length > 0 ? id : null;
  }
  return null;
}

export async function triggerPullRequestReview(
  accessToken: string,
  repoId: string | number,
  pullNumber: number,
): Promise<string> {
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
    throw new ReviewRunApiError(
      getReviewRunErrorMessage(data, "Could not start pull request review"),
      res.status,
      data,
    );
  }

  const reviewRunId = parseReviewRunId(data);
  if (!reviewRunId) {
    throw new ReviewRunApiError("Review run response was invalid", res.status, data);
  }

  return reviewRunId;
}
