import { apiBaseUrl } from "@/lib/api-config";
import { GithubInstallApiError } from "@/lib/github/github-install";

export interface LinkGithubInstallationRequest {
  installationId: number;
}

function getErrorMessage(data: unknown): string {
  if (data && typeof data === "object" && "message" in data) {
    const message = (data as { message?: unknown }).message;
    if (typeof message === "string" && message.trim().length > 0) return message;
  }
  return "Could not link GitHub installation";
}

export async function linkGithubInstallation(
  body: LinkGithubInstallationRequest,
  accessToken: string,
): Promise<void> {
  const res = await fetch(`${apiBaseUrl}/api/v1/auth/github/installations`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    credentials: "include",
  });

  const data: unknown = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new GithubInstallApiError(getErrorMessage(data), res.status, data);
  }
}
