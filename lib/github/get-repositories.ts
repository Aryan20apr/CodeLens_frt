import { apiBaseUrl } from "@/lib/api-config";
import { extractApiErrorMessage, unwrapApiResponse } from "@/lib/api-response";
import { authFetch } from "@/lib/auth/auth-fetch";
import { GithubInstallApiError } from "@/lib/github/github-install";
import type {
  GithubInstallation,
  GithubRepository,
  RepositoriesResponse,
} from "@/lib/github/types";

function parseInstallation(value: unknown): GithubInstallation | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const installationId = normalizeId(row.installationId);
  if (
    installationId == null ||
    typeof row.accountLogin !== "string" ||
    typeof row.accountType !== "string"
  ) {
    return null;
  }
  return {
    installationId,
    accountLogin: row.accountLogin,
    accountType: row.accountType,
  };
}

function normalizeId(value: unknown): string | null {
  if (typeof value === "string" && value.trim().length > 0) return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

function parseRepository(value: unknown): GithubRepository | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const installationId = normalizeId(row.installationId);
  const repoId = normalizeId(row.repoId);
  if (
    installationId == null ||
    repoId == null ||
    typeof row.fullName !== "string" ||
    typeof row.private !== "boolean" ||
    typeof row.accountLogin !== "string"
  ) {
    return null;
  }
  return {
    installationId,
    repoId,
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
  const res = await authFetch(
    `${apiBaseUrl}/api/v1/repositories`,
    {
      method: "GET",
      headers: { Accept: "*/*" },
    },
    { accessToken },
  );

  const rawJson: unknown = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new GithubInstallApiError(
      extractApiErrorMessage(rawJson, "Could not load connected repositories"),
      res.status,
      rawJson,
    );
  }

  const data = unwrapApiResponse<unknown>(rawJson);
  return parseRepositoriesResponse(data);
}
