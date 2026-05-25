export function githubPullDiffPath(repoId: string, pullNumber: number): string {
  return `/dashboard/github/${encodeURIComponent(repoId)}/pull/${pullNumber}`;
}

export function githubPagePath(repoId?: string | null): string {
  if (!repoId) return "/dashboard/github";
  return `/dashboard/github?repo=${encodeURIComponent(repoId)}`;
}
