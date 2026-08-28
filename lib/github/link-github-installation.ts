import { apiBaseUrl } from "@/lib/api-config";
import { extractApiErrorMessage } from "@/lib/api-response";
import { authFetch } from "@/lib/auth/auth-fetch";
import { GithubInstallApiError } from "@/lib/github/github-install";

export interface LinkGithubInstallationRequest {
  installationId: number;
}

export async function linkGithubInstallation(
  body: LinkGithubInstallationRequest,
  accessToken: string,
): Promise<void> {
  const res = await authFetch(
    `${apiBaseUrl}/api/v1/auth/github/installations`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
    { accessToken },
  );

  const data: unknown = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new GithubInstallApiError(
      extractApiErrorMessage(data, "Could not link GitHub installation"),
      res.status,
      data,
    );
  }
}
