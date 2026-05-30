import { authFetch } from "@/lib/auth/auth-fetch";
import { isAbortError } from "@/lib/review-runs/is-abort-error";
import { getReviewRunErrorMessage, ReviewRunApiError } from "@/lib/review-runs/review-run-api-error";
import { reviewRunStreamUrl } from "@/lib/review-runs/review-run-stream-url";

export interface ConsumeReviewRunStreamOptions {
  accessToken: string;
  reviewRunId: string;
  signal?: AbortSignal;
  onChunk: (chunk: string) => void;
}

const STREAM_RETRY_ATTEMPTS = 5;
const STREAM_RETRY_DELAY_MS = 300;

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true },
    );
  });
}

async function readStreamBody(
  res: Response,
  signal: AbortSignal | undefined,
  onChunk: (chunk: string) => void,
): Promise<void> {
  if (!res.body) {
    const text = await res.text();
    if (text) onChunk(text);
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value?.length) {
        onChunk(decoder.decode(value, { stream: true }));
      }
    }
    const remainder = decoder.decode();
    if (remainder) onChunk(remainder);
  } catch (err) {
    if (signal?.aborted || isAbortError(err)) {
      await reader.cancel().catch(() => undefined);
      return;
    }
    throw err;
  }
}

async function openReviewRunStream(
  accessToken: string,
  reviewRunId: string,
  signal: AbortSignal | undefined,
): Promise<Response> {
  return authFetch(
    reviewRunStreamUrl(reviewRunId),
    {
      method: "GET",
      headers: { Accept: "text/event-stream" },
      cache: "no-store",
      signal,
    },
    { accessToken },
  );
}

/**
 * Reads the review-run SSE stream until the connection closes or `signal` aborts.
 * Uses a same-origin Next.js proxy so the browser can consume chunked SSE reliably.
 */
export async function consumeReviewRunStream({
  accessToken,
  reviewRunId,
  signal,
  onChunk,
}: ConsumeReviewRunStreamOptions): Promise<void> {
  let lastError: unknown;

  for (let attempt = 0; attempt < STREAM_RETRY_ATTEMPTS; attempt++) {
    if (signal?.aborted) return;

    try {
      const res = await openReviewRunStream(accessToken, reviewRunId, signal);

      if (!res.ok) {
        const data: unknown = await res.json().catch(() => ({}));
        const error = new ReviewRunApiError(
          getReviewRunErrorMessage(data, "Could not load review run stream"),
          res.status,
          data,
        );

        if (error.status === 404 && attempt < STREAM_RETRY_ATTEMPTS - 1) {
          await sleep(STREAM_RETRY_DELAY_MS, signal);
          continue;
        }

        throw error;
      }

      await readStreamBody(res, signal, onChunk);
      return;
    } catch (err) {
      if (signal?.aborted || isAbortError(err)) return;
      lastError = err;

      if (
        err instanceof ReviewRunApiError &&
        err.status === 404 &&
        attempt < STREAM_RETRY_ATTEMPTS - 1
      ) {
        await sleep(STREAM_RETRY_DELAY_MS, signal);
        continue;
      }

      throw err;
    }
  }

  if (lastError) throw lastError;
}
