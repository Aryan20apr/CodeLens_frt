import { apiBaseUrl } from "@/lib/api-config";
import { extractApiErrorMessage, unwrapApiResponse } from "@/lib/api-response";
import type { ApiErrorBody, LoginResponse } from "@/lib/auth/types";

export class LoginApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body: ApiErrorBody,
  ) {
    super(message);
    this.name = "LoginApiError";
  }
}

function parseErrorBody(data: unknown): ApiErrorBody {
  if (data && typeof data === "object") return data as ApiErrorBody;
  return {};
}

export interface LoginRequestBody {
  email: string;
  password: string;
}

export async function loginUser(body: LoginRequestBody): Promise<LoginResponse> {
  const res = await fetch(`${apiBaseUrl}/api/v1/auth/login`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
  });

  const data: unknown = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errBody = parseErrorBody(data);
    const message = extractApiErrorMessage(data, "Sign in failed");
    throw new LoginApiError(message, res.status, errBody);
  }

  return unwrapApiResponse<LoginResponse>(data);
}
