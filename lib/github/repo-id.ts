import { GithubInstallApiError } from "@/lib/github/github-install";

export function normalizeRepoId(repoId: string | number): string {
  const repoIdParam = typeof repoId === "number" ? String(repoId) : repoId.trim();
  if (!repoIdParam) {
    throw new GithubInstallApiError("Repository id is required", 400, {});
  }
  return repoIdParam;
}
