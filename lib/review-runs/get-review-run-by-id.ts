import { apiBaseUrl } from "@/lib/api-config";
import { unwrapApiResponse } from "@/lib/api-response";
import { authFetch } from "@/lib/auth/auth-fetch";
import type { ReviewRun } from "@/lib/review-runs/review-run-types";

export async function getReviewRunById(
  accessToken: string,
  reviewRunId: string,
): Promise<ReviewRun> {
  const res = await authFetch(
    `${apiBaseUrl}/api/v1/review-runs/${encodeURIComponent(reviewRunId)}`,
    { headers: { Accept: "application/json" } },
    { accessToken },
  );

  const rawJson: unknown = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      (rawJson as { message?: string }).message ?? "Could not fetch review run",
    );
  }

  return unwrapApiResponse<ReviewRun>(rawJson);
}
