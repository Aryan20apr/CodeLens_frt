export type LlmProvider =
  | "NVIDIA"
  | "GROQ"
  | "GEMINI"
  | "OPENAI"
  | "ANTHROPIC"
  | (string & {});

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ApiErrorResponse {
  success: boolean;
  message: string;
  data?: unknown;
  error?: string;
  statusCode?: number;
}

export interface LlmProviderKey {
  provider: LlmProvider;
  maskedKey: string;
  updatedAt: string;
  baseUrl?: string | null;
  nvidiaBaseUrl?: string | null;
}

export interface ActiveProvider {
  provider: LlmProvider;
  model: string;
}

export interface SaveKeyResponse {
  maskedKey: string;
  models: string[];
}

export interface ModelsResponse {
  models: string[];
}

export interface SaveKeyRequest {
  apiKey: string;
  baseUrl?: string;
}

export interface SetActiveRequest {
  provider: LlmProvider;
  model: string;
}
