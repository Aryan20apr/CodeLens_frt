import { apiBaseUrl } from "@/lib/api-config";
import { GithubInstallApiError } from "@/lib/github/github-install";
import type {
  GithubInstallation,
  GithubRepository,
  RepositoriesResponse,
} from "@/lib/github/types";

function getErrorMessage(data: unknown): string {
  if (data && typeof data === "object" && "message" in data) {
    const message = (data as { message?: unknown }).message;
    if (typeof message === "string" && message.trim().length > 0) return message;
  }
  return "Could not load connected repositories";
}

function parseInstallation(value: unknown): GithubInstallation | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (
    typeof row.installationId !== "string" ||
    typeof row.accountLogin !== "string" ||
    typeof row.accountType !== "string"
  ) {
    return null;
  }
  return {
    installationId: row.installationId,
    accountLogin: row.accountLogin,
    accountType: row.accountType,
  };
}

function parseRepository(value: unknown): GithubRepository | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (
    typeof row.installationId !== "string" ||
    typeof row.repoId !== "string" ||
    typeof row.fullName !== "string" ||
    typeof row.private !== "boolean" ||
    typeof row.accountLogin !== "string"
  ) {
    return null;
  }
  return {
    installationId: row.installationId,
    repoId: row.repoId,
    fullName: row.fullName,
    private: row.private,
    accountLogin: row.accountLogin,
  };
}

function parseRepositoriesResponse(data: unknown): RepositoriesResponse {
  if (!data || typeof data !== "object") {
    throw new GithubInstallApiError("Repositories response was invalid", 200, data);
  }

  const row = data as Record<string, unknown>;
  const installations = Array.isArray(row.installations)
    ? row.installations.map(parseInstallation).filter((item): item is GithubInstallation => item != null)
    : [];
  const repositories = Array.isArray(row.repositories)
    ? row.repositories.map(parseRepository).filter((item): item is GithubRepository => item != null)
    : [];

  return {
    connected: row.connected === true,
    installationCount:
      typeof row.installationCount === "number" ? row.installationCount : installations.length,
    installations,
    repositories,
  };
}

export async function getRepositories(accessToken: string): Promise<RepositoriesResponse> {
  const res = await fetch(`${apiBaseUrl}/api/v1/repositories`, {
    method: "GET",
    headers: {
      Accept: "*/*",
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: "include",
  });

  const data: unknown = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new GithubInstallApiError(getErrorMessage(data), res.status, data);
  }

  return parseRepositoriesResponse(data);
}
