import { apiBaseUrl } from "@/lib/api-config";
import { extractApiErrorMessage, unwrapApiResponse } from "@/lib/api-response";
import { authFetch } from "@/lib/auth/auth-fetch";
import type {
  CodeReviewJobCreatedResponse,
  CodeReviewJobDetails,
  CodeReviewJobRequest,
} from "@/lib/code-review/types";

export class CodeReviewJobApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(message);
    this.name = "CodeReviewJobApiError";
  }
}

export async function submitCodeReviewJob(
  body: CodeReviewJobRequest,
  accessToken: string,
): Promise<CodeReviewJobCreatedResponse> {
  const res = await authFetch(
    `${apiBaseUrl}/api/v1/codereview/job`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
    { accessToken },
  );

  const data: unknown = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new CodeReviewJobApiError(
      extractApiErrorMessage(data, "Code review submission failed"),
      res.status,
      data,
    );
  }

  return unwrapApiResponse<CodeReviewJobCreatedResponse>(data);
}

export async function getCodeReviewJobDetails(
  jobId: string,
  accessToken: string,
): Promise<CodeReviewJobDetails> {
  const res = await authFetch(
    `${apiBaseUrl}/api/v1/codereview/${jobId}`,
    {
      method: "GET",
      headers: { Accept: "*/*" },
    },
    { accessToken },
  );

  const data: unknown = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new CodeReviewJobApiError(
      extractApiErrorMessage(data, "Could not fetch code review job details"),
      res.status,
      data,
    );
  }

  return unwrapApiResponse<CodeReviewJobDetails>(data);
}
