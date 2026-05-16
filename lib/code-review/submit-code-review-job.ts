import { apiBaseUrl } from "@/lib/api-config";
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

function getErrorMessage(data: unknown): string {
  if (data && typeof data === "object" && "message" in data) {
    const message = (data as { message?: unknown }).message;
    if (typeof message === "string" && message.trim().length > 0) return message;
  }
  return "Code review submission failed";
}

export async function submitCodeReviewJob(
  body: CodeReviewJobRequest,
  accessToken: string,
): Promise<CodeReviewJobCreatedResponse> {
  const res = await fetch(`${apiBaseUrl}/api/v1/codereview/job`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    credentials: "include",
  });

  const data: unknown = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new CodeReviewJobApiError(getErrorMessage(data), res.status, data);
  }

  return data as CodeReviewJobCreatedResponse;
}

export async function getCodeReviewJobDetails(
  jobId: string,
  accessToken: string,
): Promise<CodeReviewJobDetails> {
  const res = await fetch(`${apiBaseUrl}/api/v1/codereview/${jobId}`, {
    method: "GET",
    headers: {
      Accept: "*/*",
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: "include",
  });

  const data: unknown = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new CodeReviewJobApiError(getErrorMessage(data), res.status, data);
  }

  return data as CodeReviewJobDetails;
}
