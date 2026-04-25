import { apiBaseUrl } from "@/lib/api-config";
import type { ApiErrorBody, RegisterResponse } from "@/lib/auth/types";

export class RegisterApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body: ApiErrorBody,
  ) {
    super(message);
    this.name = "RegisterApiError";
  }
}

function parseErrorBody(data: unknown): ApiErrorBody {
  if (data && typeof data === "object" && "message" in data)
    return data as ApiErrorBody;
  return {};
}

export interface RegisterRequestBody {
  email: string;
  password: string;
  name: string;
}

export async function registerUser(body: RegisterRequestBody): Promise<RegisterResponse> {
  const res = await fetch(`${apiBaseUrl}/api/v1/auth/register`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
  });

  const data: unknown = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errBody = parseErrorBody(data);
    const message =
      typeof errBody.message === "string" && errBody.message.length > 0
        ? errBody.message
        : "Registration failed";
    throw new RegisterApiError(message, res.status, errBody);
  }

  return data as RegisterResponse;
}
