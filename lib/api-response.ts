/**
 * Standardized API response and error envelope types and utilities
 * shared across all frontend API clients.
 */

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  error?: string;
  statusCode?: number;
}

export interface ApiErrorResponse {
  success?: boolean;
  message?: string | string[];
  data?: unknown;
  details?: unknown;
  error?: string;
  statusCode?: number;
}

/**
 * Extracts a descriptive human-readable error message from standardized
 * API error responses, validation failure objects, or generic error payloads.
 */
export function extractApiErrorMessage(
  data: unknown,
  fallback = "Request failed",
): string {
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;

    // 1. Extract structured validation details if present in `data` or `details`
    const validationSource =
      obj.data && typeof obj.data === "object" && !Array.isArray(obj.data)
        ? (obj.data as Record<string, unknown>)
        : obj.details && typeof obj.details === "object" && !Array.isArray(obj.details)
          ? (obj.details as Record<string, unknown>)
          : null;

    const detailMessages: string[] = [];
    if (validationSource) {
      for (const [key, val] of Object.entries(validationSource)) {
        if (Array.isArray(val) && val.length > 0) {
          const strings = val.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
          if (strings.length > 0) {
            detailMessages.push(`${key}: ${strings.join(", ")}`);
          }
        } else if (typeof val === "string" && val.trim().length > 0) {
          detailMessages.push(`${key}: ${val.trim()}`);
        }
      }
    }

    // 2. Extract primary message
    let primaryMessage: string | null = null;
    if (typeof obj.message === "string" && obj.message.trim().length > 0) {
      primaryMessage = obj.message.trim();
    } else if (Array.isArray(obj.message)) {
      const messages = obj.message.filter(
        (m): m is string => typeof m === "string" && m.trim().length > 0,
      );
      if (messages.length > 0) {
        primaryMessage = messages.join(", ");
      }
    } else if (typeof obj.error === "string" && obj.error.trim().length > 0) {
      primaryMessage = obj.error.trim();
    }

    // 3. Combine primary message and validation details
    if (detailMessages.length > 0) {
      return primaryMessage
        ? `${primaryMessage}: ${detailMessages.join("; ")}`
        : detailMessages.join("; ");
    }

    if (primaryMessage) {
      return primaryMessage;
    }
  }

  return fallback;
}

/**
 * Automatically unwraps standardized API response envelopes ({ success: true, data: T })
 * while preserving backward compatibility with direct/unwrapped payloads.
 */
export function unwrapApiResponse<T>(payload: unknown): T {
  if (
    payload &&
    typeof payload === "object" &&
    "success" in payload &&
    (payload as { success?: unknown }).success === true &&
    "data" in payload &&
    (payload as { data?: unknown }).data !== undefined
  ) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}
