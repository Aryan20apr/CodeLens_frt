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
