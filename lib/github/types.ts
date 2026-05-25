export interface GithubInstallation {
  installationId: string;
  accountLogin: string;
  accountType: string;
}

export interface GithubRepository {
  installationId: string;
  repoId: string;
  fullName: string;
  private: boolean;
  accountLogin: string;
}

export interface RepositoriesResponse {
  connected: boolean;
  installationCount: number;
  installations: GithubInstallation[];
  repositories: GithubRepository[];
}

export type PullRequestState = "open" | "closed" | "all";

export interface GithubPullRequest {
  number: number;
  title: string;
  state: string;
  authorLogin: string;
  headSha: string;
  baseSha: string;
  createdAt: string;
  updatedAt: string;
  htmlUrl: string;
}

export interface GithubPullRequestDetail extends GithubPullRequest {
  body: string | null;
  merged: boolean;
  draft: boolean;
}

export type PullRequestFileStatus =
  | "added"
  | "removed"
  | "modified"
  | "renamed"
  | "copied"
  | "changed"
  | "unchanged";

export interface GithubPullRequestFile {
  filename: string;
  previousFilename: string | null;
  status: PullRequestFileStatus;
  additions: number;
  deletions: number;
  patch: string | null;
  hunks: unknown[];
}
