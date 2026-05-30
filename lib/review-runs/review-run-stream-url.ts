/** Same-origin proxy route; avoids cross-origin SSE/CORS issues in the browser. */
export function reviewRunStreamUrl(reviewRunId: string): string {
  return `/api/v1/review-runs/${encodeURIComponent(reviewRunId)}/stream`;
}
