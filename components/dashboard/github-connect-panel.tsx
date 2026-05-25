"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle2, ExternalLink, GitBranch, Loader2 } from "lucide-react";
import { GithubPullRequestsSection } from "@/components/dashboard/github-pull-requests-section";
import { GithubRepositoriesSection } from "@/components/dashboard/github-repositories-section";
import { getAuthSession } from "@/lib/auth/session";
import { getPullRequests } from "@/lib/github/get-pull-requests";
import { getRepositories } from "@/lib/github/get-repositories";
import { githubPagePath } from "@/lib/github/github-routes";
import {
  GithubInstallApiError,
  startGithubAppInstall,
} from "@/lib/github/github-install";
import type {
  GithubPullRequest,
  GithubRepository,
  PullRequestState,
  RepositoriesResponse,
} from "@/lib/github/types";

const CALLBACK_ERROR_MESSAGES: Record<string, string> = {
  missing_installation: "GitHub did not return an installation id. Try connecting again.",
  invalid_state: "This install session expired or was invalid. Start over from this page.",
  unauthenticated: "Sign in again, then reconnect your GitHub App installation.",
  link_failed: "CodeLens could not save your GitHub installation. Try again in a moment.",
};

function getCallbackErrorMessage(code: string | null): string | null {
  if (!code) return null;
  return CALLBACK_ERROR_MESSAGES[code] ?? "GitHub installation could not be completed.";
}

export function GithubConnectPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const repoIdFromQuery = searchParams.get("repo");
  const [error, setError] = useState<string | null>(null);
  const [reposError, setReposError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoadingRepos, setIsLoadingRepos] = useState(true);
  const [isRefreshingRepos, setIsRefreshingRepos] = useState(false);
  const [reposData, setReposData] = useState<RepositoriesResponse | null>(null);
  const [selectedRepo, setSelectedRepo] = useState<GithubRepository | null>(null);
  const [prState, setPrState] = useState<PullRequestState>("open");
  const prStateRef = useRef<PullRequestState>(prState);
  prStateRef.current = prState;
  const [pullRequests, setPullRequests] = useState<GithubPullRequest[]>([]);
  const [prError, setPrError] = useState<string | null>(null);
  const [isLoadingPrs, setIsLoadingPrs] = useState(false);

  const installed = searchParams.get("installed") === "1";
  const callbackError = useMemo(
    () => getCallbackErrorMessage(searchParams.get("error")),
    [searchParams],
  );

  const loadPullRequests = useCallback(
    async (repo: GithubRepository, state: PullRequestState) => {
      const session = getAuthSession();
      if (!session?.accessToken) {
        setPullRequests([]);
        setPrError("Your session is missing an access token. Please sign in again.");
        setIsLoadingPrs(false);
        return;
      }

      setIsLoadingPrs(true);
      setPrError(null);

      try {
        const data = await getPullRequests(session.accessToken, repo.repoId, { state });
        setPullRequests(data);
      } catch (err) {
        setPullRequests([]);
        if (err instanceof GithubInstallApiError) {
          setPrError(err.message);
        } else {
          setPrError("Could not load pull requests.");
        }
      } finally {
        setIsLoadingPrs(false);
      }
    },
    [],
  );

  const loadRepositories = useCallback(async (mode: "initial" | "refresh" = "initial") => {
    const session = getAuthSession();
    if (!session?.accessToken) {
      setReposData(null);
      setReposError("Your session is missing an access token. Please sign in again.");
      setIsLoadingRepos(false);
      setIsRefreshingRepos(false);
      return;
    }

    if (mode === "initial") {
      setIsLoadingRepos(true);
    } else {
      setIsRefreshingRepos(true);
    }
    setReposError(null);

    try {
      const data = await getRepositories(session.accessToken);
      setReposData(data);
      setSelectedRepo((current) => {
        if (!current) return null;
        const next = data.repositories.find((repo) => repo.repoId === current.repoId) ?? null;
        if (next) {
          void loadPullRequests(next, prStateRef.current);
        } else {
          setPullRequests([]);
          setPrError(null);
          setIsLoadingPrs(false);
        }
        return next;
      });
    } catch (err) {
      setReposData(null);
      if (err instanceof GithubInstallApiError) {
        setReposError(err.message);
      } else {
        setReposError("Could not load connected repositories.");
      }
    } finally {
      setIsLoadingRepos(false);
      setIsRefreshingRepos(false);
    }
  }, [loadPullRequests]);

  useEffect(() => {
    void loadRepositories();
  }, [loadRepositories, installed]);

  useEffect(() => {
    if (!reposData?.repositories.length || !repoIdFromQuery) return;
    const repo =
      reposData.repositories.find((item) => item.repoId === repoIdFromQuery) ?? null;
    if (!repo) return;
    setSelectedRepo((current) => {
      if (current?.repoId === repo.repoId) return current;
      void loadPullRequests(repo, prStateRef.current);
      return repo;
    });
  }, [reposData, repoIdFromQuery, loadPullRequests]);

  const isConnected = !isLoadingRepos && reposData?.connected === true;

  function handleConnect() {
    setError(null);

    const session = getAuthSession();
    if (!session?.accessToken) {
      setError("Your session is missing an access token. Please sign in again.");
      return;
    }

    setIsConnecting(true);
    void (async () => {
      try {
        await startGithubAppInstall(session.accessToken);
      } catch (err) {
        if (err instanceof GithubInstallApiError) {
          setError(err.message);
          return;
        }
        setError("Something went wrong while starting GitHub installation.");
      } finally {
        setIsConnecting(false);
      }
    })();
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="flex flex-col gap-2">
        <span
          className="text-xs font-semibold uppercase tracking-[0.24em]"
          style={{ color: "var(--primary)", fontFamily: "var(--font-space-grotesk)" }}
        >
          GitHub
        </span>
        <h1
          className="text-2xl font-bold"
          style={{ color: "var(--on-surface)", fontFamily: "var(--font-geist-sans)" }}
        >
          {isConnected ? "GitHub repositories" : "Connect a repository"}
        </h1>
        <p
          className="max-w-2xl text-sm leading-6"
          style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}
        >
          {isConnected
            ? "Repositories available to CodeLens through your GitHub App installation."
            : "Install the CodeLens GitHub App on your account so pull request reviews can run against your repositories."}
        </p>
      </div>

      <section>
        <div
          className="rounded-2xl p-6"
          style={{ background: "var(--surface-container)", boxShadow: "var(--shadow-card)" }}
        >
          <div className="flex items-start gap-4">
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
              style={{ background: "rgba(192,193,255,0.12)", color: "var(--primary)" }}
            >
              <GitBranch size={22} aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <h2
                className="text-base font-semibold"
                style={{ color: "var(--on-surface)", fontFamily: "var(--font-geist-sans)" }}
              >
                GitHub App installation
              </h2>
              <p
                className="mt-2 text-sm leading-6"
                style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}
              >
                CodeLens uses a GitHub App to receive webhooks and post review feedback on pull
                requests. You will be redirected to GitHub to complete installation.
              </p>
              <button
                type="button"
                onClick={handleConnect}
                disabled={isConnecting}
                className="btn-primary mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold disabled:pointer-events-none disabled:opacity-50"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                {isConnecting ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <ExternalLink className="h-4 w-4" aria-hidden />
                )}
                {isConnecting
                  ? "Opening GitHub…"
                  : isConnected
                    ? "Manage on GitHub"
                    : "Connect repository on GitHub"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {isLoadingRepos && (
        <div
          className="flex items-center gap-3 rounded-2xl p-4 text-sm"
          style={{
            background: "var(--surface-container)",
            color: "var(--on-surface-variant)",
            fontFamily: "var(--font-space-grotesk)",
          }}
        >
          <Loader2 className="h-4 w-4 animate-spin" style={{ color: "var(--primary)" }} aria-hidden />
          Loading connected repositories…
        </div>
      )}

      {!isLoadingRepos && reposError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl p-4 text-sm"
          style={{
            background: "rgba(255,180,171,0.1)",
            border: "1px solid rgba(255,180,171,0.3)",
            color: "var(--on-surface)",
            fontFamily: "var(--font-space-grotesk)",
          }}
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--error)" }} aria-hidden />
          <span>{reposError}</span>
        </div>
      )}

      {!isLoadingRepos && reposData?.connected && (
        <>
          <GithubRepositoriesSection
            data={reposData}
            isRefreshing={isRefreshingRepos}
            onRefresh={() => {
              void loadRepositories("refresh");
            }}
            selectedRepoId={selectedRepo?.repoId ?? null}
            onSelectRepo={(repoId) => {
              const repo = reposData.repositories.find((item) => item.repoId === repoId) ?? null;
              setSelectedRepo(repo);
              setPrState("open");
              setPullRequests([]);
              router.replace(githubPagePath(repoId), { scroll: false });
              if (repo) {
                void loadPullRequests(repo, "open");
              } else {
                setPrError(null);
                setIsLoadingPrs(false);
              }
            }}
          />
          {selectedRepo && (
            <GithubPullRequestsSection
              repo={selectedRepo}
              state={prState}
              pullRequests={pullRequests}
              isLoading={isLoadingPrs}
              error={prError}
              onBack={() => {
                setSelectedRepo(null);
                setPullRequests([]);
                setPrError(null);
                setIsLoadingPrs(false);
                setPrState("open");
                router.replace(githubPagePath(), { scroll: false });
              }}
              onStateChange={(nextState) => {
                setPrState(nextState);
                void loadPullRequests(selectedRepo, nextState);
              }}
            />
          )}
        </>
      )}

      {installed && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-2xl p-4 text-sm"
          style={{
            background: "rgba(192,193,255,0.1)",
            border: "1px solid rgba(192,193,255,0.3)",
            color: "var(--on-surface)",
            fontFamily: "var(--font-space-grotesk)",
          }}
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--primary)" }} aria-hidden />
          <span>GitHub App installed and linked to your CodeLens account.</span>
        </div>
      )}

      {callbackError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl p-4 text-sm"
          style={{
            background: "rgba(255,180,171,0.1)",
            border: "1px solid rgba(255,180,171,0.3)",
            color: "var(--on-surface)",
            fontFamily: "var(--font-space-grotesk)",
          }}
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--error)" }} aria-hidden />
          <span>{callbackError}</span>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl p-4 text-sm"
          style={{
            background: "rgba(255,180,171,0.1)",
            border: "1px solid rgba(255,180,171,0.3)",
            color: "var(--on-surface)",
            fontFamily: "var(--font-space-grotesk)",
          }}
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--error)" }} aria-hidden />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
