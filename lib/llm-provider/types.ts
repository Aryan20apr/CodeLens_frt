export type LlmProvider =
  | "NVIDIA"
  | "GROQ"
  | "GEMINI"
  | "OPENAI"
  | "ANTHROPIC"
  | (string & {});

export interface LlmProviderKey {
  provider: LlmProvider;
  maskedKey: string;
  updatedAt: string;
  nvidiaBaseUrl: string | null;
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
