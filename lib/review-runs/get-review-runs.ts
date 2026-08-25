import { apiBaseUrl } from "@/lib/api-config";
import { unwrapApiResponse } from "@/lib/api-response";
import { authFetch } from "@/lib/auth/auth-fetch";
import type { ReviewRunList } from "@/lib/review-runs/review-run-types";

export async function getReviewRuns(
  accessToken: string,
  repoFullName: string,
  prNumber: number,
  page = 1,
  perPage = 20,
): Promise<ReviewRunList> {
  const params = new URLSearchParams({
    repoFullName,
    prNumber: String(prNumber),
    page: String(page),
    perPage: String(perPage),
  });

  const res = await authFetch(
    `${apiBaseUrl}/api/v1/review-runs?${params.toString()}`,
    { headers: { Accept: "application/json" } },
    { accessToken },
  );

  const rawJson: unknown = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      (rawJson as { message?: string }).message ?? "Could not fetch review runs",
    );
  }

  return unwrapApiResponse<ReviewRunList>(rawJson);
}
