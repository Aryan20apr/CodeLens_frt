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

    // Handle nested validation details in `data` or `details` (e.g. { data: { apiKey: ["..."] } })
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
          detailMessages.push(`${key}: ${val.join(", ")}`);
        } else if (typeof val === "string" && val.trim().length > 0) {
          detailMessages.push(`${key}: ${val.trim()}`);
        }
      }
    }

    const mainMessage =
      typeof obj.message === "string" && obj.message.trim().length > 0
        ? obj.message.trim()
        : Array.isArray(obj.message)
          ? obj.message.join(", ")
          : typeof obj.error === "string" && obj.error.trim().length > 0
            ? obj.error.trim()
            : null;

    if (detailMessages.length > 0) {
      return mainMessage ? `${mainMessage}: ${detailMessages.join("; ")}` : detailMessages.join("; ");
    }

    if (mainMessage) {
      return mainMessage;
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

  const json: unknown = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new LlmProviderApiError(extractMessage(json), res.status, json);
  }

  // Automatically unwrap standardized API response envelope: { success: boolean, data: T, message?: string }
  if (json && typeof json === "object" && "success" in json) {
    const envelope = json as { success?: boolean; data?: unknown };
    if ("data" in envelope && envelope.data !== undefined) {
      return envelope.data;
    }
  }

  return json;
}

export async function fetchProviderKeys(
  accessToken?: string,
): Promise<LlmProviderKey[]> {
  const data = (await llmFetch(
    "/api/v1/llm-provider/keys",
    { method: "GET" },
    accessToken,
  )) as LlmProviderKey[];

  const list = Array.isArray(data) ? data : [];
  return list.map((item) => ({
    ...item,
    baseUrl: item.baseUrl ?? item.nvidiaBaseUrl ?? null,
  }));
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
  const data = await llmFetch(
    `/api/v1/llm-provider/keys/${provider}/models`,
    { method: "GET" },
    accessToken,
  );

  if (Array.isArray(data)) {
    return { models: data as string[] };
  }
  if (
    data &&
    typeof data === "object" &&
    "models" in data &&
    Array.isArray((data as { models: unknown }).models)
  ) {
    return data as ModelsResponse;
  }
  return { models: [] };
}

export async function fetchActiveProvider(
  accessToken?: string,
): Promise<ActiveProvider | null> {
  const data = await llmFetch(
    "/api/v1/llm-provider/active",
    { method: "GET" },
    accessToken,
  );

  if (!data || (typeof data === "object" && Object.keys(data).length === 0)) {
    return null;
  }
  return data as ActiveProvider;
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

