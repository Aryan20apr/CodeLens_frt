import { apiBaseUrl } from "@/lib/api-config";
import { authFetch } from "@/lib/auth/auth-fetch";
import { GithubInstallApiError } from "@/lib/github/github-install";
import { normalizeRepoId } from "@/lib/github/repo-id";
import type { GithubPullRequestDetail } from "@/lib/github/types";

function getErrorMessage(data: unknown): string {
  if (data && typeof data === "object" && "message" in data) {
    const message = (data as { message?: unknown }).message;
    if (typeof message === "string" && message.trim().length > 0) return message;
  }
  return "Could not load pull request";
}

function parsePullRequestDetail(value: unknown): GithubPullRequestDetail | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (
    typeof row.number !== "number" ||
    typeof row.title !== "string" ||
    typeof row.state !== "string" ||
    typeof row.authorLogin !== "string" ||
    typeof row.headSha !== "string" ||
    typeof row.baseSha !== "string" ||
    typeof row.createdAt !== "string" ||
    typeof row.updatedAt !== "string" ||
    typeof row.htmlUrl !== "string" ||
    typeof row.merged !== "boolean" ||
    typeof row.draft !== "boolean"
  ) {
    return null;
  }
  const body = row.body;
  return {
    number: row.number,
    title: row.title,
    state: row.state,
    authorLogin: row.authorLogin,
    headSha: row.headSha,
    baseSha: row.baseSha,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    htmlUrl: row.htmlUrl,
    body: body === null || typeof body === "string" ? body : null,
    merged: row.merged,
    draft: row.draft,
  };
}

export async function getPullRequest(
  accessToken: string,
  repoId: string | number,
  pullNumber: number,
): Promise<GithubPullRequestDetail> {
  const repoIdParam = normalizeRepoId(repoId);

  const res = await authFetch(
    `${apiBaseUrl}/api/v1/repositories/${encodeURIComponent(repoIdParam)}/pull-requests/${pullNumber}`,
    {
      method: "GET",
      headers: { Accept: "*/*" },
    },
    { accessToken },
  );

  const data: unknown = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new GithubInstallApiError(getErrorMessage(data), res.status, data);
  }

  const detail = parsePullRequestDetail(data);
  if (!detail) {
    throw new GithubInstallApiError("Pull request response was invalid", 200, data);
  }
  return detail;
}
