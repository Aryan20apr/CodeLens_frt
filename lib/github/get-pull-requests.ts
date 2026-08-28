import { apiBaseUrl } from "@/lib/api-config";
import { extractApiErrorMessage, unwrapApiResponse } from "@/lib/api-response";
import { authFetch } from "@/lib/auth/auth-fetch";
import { GithubInstallApiError } from "@/lib/github/github-install";
import { normalizeRepoId } from "@/lib/github/repo-id";
import type { GithubPullRequest, PullRequestState } from "@/lib/github/types";

function parsePullRequest(value: unknown): GithubPullRequest | null {
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
    typeof row.htmlUrl !== "string"
  ) {
    return null;
  }
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
  };
}

export interface GetPullRequestsOptions {
  page?: number;
  perPage?: number;
  state?: PullRequestState;
}

export async function getPullRequests(
  accessToken: string,
  repoId: string | number,
  options: GetPullRequestsOptions = {},
): Promise<GithubPullRequest[]> {
  const repoIdParam = normalizeRepoId(repoId);
  const page = options.page ?? 1;
  const perPage = options.perPage ?? 10;
  const state = options.state ?? "open";

  const params = new URLSearchParams({
    page: String(page),
    perPage: String(perPage),
    state,
  });

  const res = await authFetch(
    `${apiBaseUrl}/api/v1/repositories/${encodeURIComponent(repoIdParam)}/pull-requests?${params}`,
    {
      method: "GET",
      headers: { Accept: "*/*" },
    },
    { accessToken },
  );

  const rawJson: unknown = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new GithubInstallApiError(
      extractApiErrorMessage(rawJson, "Could not load pull requests"),
      res.status,
      rawJson,
    );
  }

  const data = unwrapApiResponse<unknown>(rawJson);
  if (!Array.isArray(data)) {
    throw new GithubInstallApiError("Pull requests response was invalid", 200, rawJson);
  }

  return data
    .map(parsePullRequest)
    .filter((item): item is GithubPullRequest => item != null);
}
