import { apiBaseUrl } from "@/lib/api-config";
import type { ApiErrorBody, AuthUser, CurrentUserResponse } from "@/lib/auth/types";

export class CurrentUserApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body: ApiErrorBody,
  ) {
    super(message);
    this.name = "CurrentUserApiError";
  }
}

function parseErrorBody(data: unknown): ApiErrorBody {
  if (data && typeof data === "object" && "message" in data) return data as ApiErrorBody;
  return {};
}

export function mapCurrentUserToAuthUser(data: CurrentUserResponse): AuthUser {
  const avatarUrl = data.avatarUrl?.trim();
  return {
    id: data.id,
    email: data.email,
    name: data.name,
    avatarUrl: avatarUrl ? avatarUrl : null,
    role: data.role,
  };
}

export async function fetchCurrentUser(accessToken: string): Promise<CurrentUserResponse> {
  const res = await fetch(`${apiBaseUrl}/api/v1/users/me`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: "include",
  });

  const data: unknown = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errBody = parseErrorBody(data);
    const message =
      typeof errBody.message === "string" && errBody.message.length > 0
        ? errBody.message
        : "Could not load your profile";
    throw new CurrentUserApiError(message, res.status, errBody);
  }

  return data as CurrentUserResponse;
}
