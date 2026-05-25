import { apiBaseUrl } from "@/lib/api-config";
import { authFetch } from "@/lib/auth/auth-fetch";
import { GithubInstallApiError } from "@/lib/github/github-install";
import { normalizeRepoId } from "@/lib/github/repo-id";
import type { GithubPullRequestFile, PullRequestFileStatus } from "@/lib/github/types";

function getErrorMessage(data: unknown): string {
  if (data && typeof data === "object" && "message" in data) {
    const message = (data as { message?: unknown }).message;
    if (typeof message === "string" && message.trim().length > 0) return message;
  }
  return "Could not load pull request files";
}

const FILE_STATUSES: PullRequestFileStatus[] = [
  "added",
  "removed",
  "modified",
  "renamed",
  "copied",
  "changed",
  "unchanged",
];

function parseFileStatus(value: unknown): PullRequestFileStatus | null {
  if (typeof value !== "string") return null;
  return FILE_STATUSES.includes(value as PullRequestFileStatus)
    ? (value as PullRequestFileStatus)
    : null;
}

function parsePullRequestFile(value: unknown): GithubPullRequestFile | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const status = parseFileStatus(row.status);
  if (
    typeof row.filename !== "string" ||
    status == null ||
    typeof row.additions !== "number" ||
    typeof row.deletions !== "number"
  ) {
    return null;
  }
  const previousFilename = row.previousFilename;
  const patch = row.patch;
  return {
    filename: row.filename,
    previousFilename:
      previousFilename === null || typeof previousFilename === "string"
        ? previousFilename
        : null,
    status,
    additions: row.additions,
    deletions: row.deletions,
    patch: patch === null || typeof patch === "string" ? patch : null,
    hunks: Array.isArray(row.hunks) ? row.hunks : [],
  };
}

export async function getPullRequestFiles(
  accessToken: string,
  repoId: string | number,
  pullNumber: number,
): Promise<GithubPullRequestFile[]> {
  const repoIdParam = normalizeRepoId(repoId);

  const res = await authFetch(
    `${apiBaseUrl}/api/v1/repositories/${encodeURIComponent(repoIdParam)}/pull-requests/${pullNumber}/files`,
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

  if (!Array.isArray(data)) {
    throw new GithubInstallApiError("Pull request files response was invalid", 200, data);
  }

  return data
    .map(parsePullRequestFile)
    .filter((item): item is GithubPullRequestFile => item != null);
}
