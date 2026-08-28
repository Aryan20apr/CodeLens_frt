import { extractApiErrorMessage } from "@/lib/api-response";

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

export function getReviewRunErrorMessage(data: unknown, fallback: string): string {
  return extractApiErrorMessage(data, fallback);
}
