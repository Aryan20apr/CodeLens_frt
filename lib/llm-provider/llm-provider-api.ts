import { apiBaseUrl } from "@/lib/api-config";
import { authFetch } from "@/lib/auth/auth-fetch";
import type {
  ActiveProvider,
  LlmProvider,
  LlmProviderKey,
  ModelsResponse,
  SaveKeyResponse,
} from "@/lib/llm-provider/types";

export class LlmProviderApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(message);
    this.name = "LlmProviderApiError";
  }
}

function extractMessage(data: unknown): string {
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;

    // Handle Zod validation error details like { details: { apiKey: ["..."] } }
    if (obj.details && typeof obj.details === "object") {
      const details = obj.details as Record<string, unknown>;
      const detailMessages: string[] = [];
      for (const [key, val] of Object.entries(details)) {
        if (Array.isArray(val) && val.length > 0) {
          detailMessages.push(`${key}: ${val.join(", ")}`);
        } else if (typeof val === "string") {
          detailMessages.push(`${key}: ${val}`);
        }
      }
      if (detailMessages.length > 0) {
        return detailMessages.join("; ");
      }
    }

    if (Array.isArray(obj.message)) {
      return obj.message.join(", ");
    }
    if (typeof obj.message === "string" && obj.message.trim().length > 0) {
      return obj.message.trim();
    }
    if (typeof obj.error === "string" && obj.error.trim().length > 0) {
      return obj.error.trim();
    }
  }
  return "LLM provider API request failed";
}

async function llmFetch(
  path: string,
  init: RequestInit,
  accessToken?: string,
): Promise<unknown> {
  const res = await authFetch(
    `${apiBaseUrl}${path}`,
    {
      ...init,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(init.headers as Record<string, string> | undefined),
      },
    },
    accessToken ? { accessToken } : {},
  );

  const data: unknown = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new LlmProviderApiError(extractMessage(data), res.status, data);
  }
  return data;
}

export async function fetchProviderKeys(
  accessToken?: string,
): Promise<LlmProviderKey[]> {
  return llmFetch(
    "/api/v1/llm-provider/keys",
    { method: "GET" },
    accessToken,
  ) as Promise<LlmProviderKey[]>;
}

export async function saveProviderKey(
  provider: LlmProvider,
  apiKey: string,
  baseUrl?: string | null,
  accessToken?: string,
): Promise<SaveKeyResponse> {
  return llmFetch(
    `/api/v1/llm-provider/keys/${provider}`,
    {
      method: "PUT",
      body: JSON.stringify({
        apiKey,
        baseUrl: baseUrl?.trim() ? baseUrl.trim() : undefined,
      }),
    },
    accessToken,
  ) as Promise<SaveKeyResponse>;
}

export async function fetchProviderModels(
  provider: LlmProvider,
  accessToken?: string,
): Promise<ModelsResponse> {
  return llmFetch(
    `/api/v1/llm-provider/keys/${provider}/models`,
    { method: "GET" },
    accessToken,
  ) as Promise<ModelsResponse>;
}

export async function fetchActiveProvider(
  accessToken?: string,
): Promise<ActiveProvider> {
  return llmFetch(
    "/api/v1/llm-provider/active",
    { method: "GET" },
    accessToken,
  ) as Promise<ActiveProvider>;
}

export async function setActiveProvider(
  provider: LlmProvider,
  model: string,
  accessToken?: string,
): Promise<{ success: boolean }> {
  return llmFetch(
    "/api/v1/llm-provider/active",
    {
      method: "PUT",
      body: JSON.stringify({ provider, model }),
    },
    accessToken,
  ) as Promise<{ success: boolean }>;
}

export async function deleteProviderKey(
  provider: LlmProvider,
  accessToken?: string,
): Promise<{ success: boolean }> {
  return llmFetch(
    `/api/v1/llm-provider/keys/${provider}`,
    { method: "DELETE" },
    accessToken,
  ) as Promise<{ success: boolean }>;
}

