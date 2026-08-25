import { apiBaseUrl } from "@/lib/api-config";
import { extractApiErrorMessage, unwrapApiResponse } from "@/lib/api-response";
import { authFetch } from "@/lib/auth/auth-fetch";
import { GithubInstallApiError } from "@/lib/github/github-install";
import { normalizeRepoId } from "@/lib/github/repo-id";
import type { GithubPullRequestDetail } from "@/lib/github/types";

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

  const rawJson: unknown = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new GithubInstallApiError(
      extractApiErrorMessage(rawJson, "Could not load pull request"),
      res.status,
      rawJson,
    );
  }

  const data = unwrapApiResponse<unknown>(rawJson);
  const detail = parsePullRequestDetail(data);
  if (!detail) {
    throw new GithubInstallApiError("Pull request response was invalid", 200, rawJson);
  }
  return detail;
}
