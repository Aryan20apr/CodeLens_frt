import { apiBaseUrl } from "@/lib/api-config";
import { authFetch } from "@/lib/auth/auth-fetch";
import { createGithubInstallState } from "@/lib/github/install-state";

export interface GithubInstallResponse {
  installUrl: string;
}

export class GithubInstallApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(message);
    this.name = "GithubInstallApiError";
  }
}

function getErrorMessage(data: unknown): string {
  if (data && typeof data === "object" && "message" in data) {
    const message = (data as { message?: unknown }).message;
    if (typeof message === "string" && message.trim().length > 0) return message;
  }
  return "Could not start GitHub App installation";
}

function parseInstallUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new GithubInstallApiError("Install URL was missing from the API response", 200, {});
  }

  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    throw new GithubInstallApiError("Install URL from the API was invalid", 200, { installUrl: raw });
  }

  if (url.protocol === "http:" && url.hostname === "github.com") {
    url.protocol = "https:";
  }

  return url.href;
}

export function appendStateToInstallUrl(installUrl: string, state: string): string {
  const url = new URL(installUrl);
  url.searchParams.set("state", state);
  return url.href;
}

export async function getGithubInstallUrl(accessToken: string): Promise<GithubInstallResponse> {
  const res = await authFetch(
    `${apiBaseUrl}/api/v1/auth/github/install`,
    {
      method: "GET",
      headers: { Accept: "application/json" },
    },
    { accessToken },
  );

  const data: unknown = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new GithubInstallApiError(getErrorMessage(data), res.status, data);
  }

  const installUrl =
    data && typeof data === "object" && "installUrl" in data
      ? (data as { installUrl?: unknown }).installUrl
      : undefined;

  if (typeof installUrl !== "string") {
    throw new GithubInstallApiError("Install URL was missing from the API response", res.status, data);
  }

  return { installUrl: parseInstallUrl(installUrl) };
}

export async function startGithubAppInstall(accessToken: string): Promise<void> {
  const { installUrl } = await getGithubInstallUrl(accessToken);
  const state = createGithubInstallState();
  window.location.assign(appendStateToInstallUrl(installUrl, state));
}

export function parseInstallationIdFromQuery(value: string | null): number | null {
  if (value == null || value.trim() === "") return null;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}
