"use client";

import { Globe, Lock, RefreshCw } from "lucide-react";
import type { RepositoriesResponse } from "@/lib/github/types";

interface GithubRepositoriesSectionProps {
  data: RepositoriesResponse;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export function GithubRepositoriesSection({
  data,
  isRefreshing,
  onRefresh,
}: GithubRepositoriesSectionProps) {
  const { installations, repositories, installationCount } = data;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2
            className="text-base font-semibold"
            style={{ color: "var(--on-surface)", fontFamily: "var(--font-geist-sans)" }}
          >
            Connected repositories
          </h2>
          <p
            className="mt-1 text-sm"
            style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}
          >
            {installationCount} installation{installationCount === 1 ? "" : "s"} ·{" "}
            {repositories.length} repositor{repositories.length === 1 ? "y" : "ies"}
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="inline-flex h-9 items-center justify-center gap-2 self-start rounded-lg px-3 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{
            background: "var(--surface-high)",
            border: "1px solid rgba(70,69,84,0.45)",
            color: "var(--on-surface)",
            fontFamily: "var(--font-space-grotesk)",
          }}
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} aria-hidden />
          Refresh
        </button>
      </div>

      {installations.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {installations.map((installation) => (
            <span
              key={installation.installationId}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold"
              style={{
                background: "rgba(192,193,255,0.12)",
                color: "var(--on-surface)",
                fontFamily: "var(--font-space-grotesk)",
              }}
            >
              <span style={{ color: "var(--primary)" }}>{installation.accountLogin}</span>
              <span style={{ color: "var(--on-surface-variant)" }}>{installation.accountType}</span>
            </span>
          ))}
        </div>
      )}

      <div
        className="overflow-hidden rounded-2xl"
        style={{ background: "var(--surface-container)", boxShadow: "var(--shadow-card)" }}
      >
        {repositories.length === 0 ? (
          <p
            className="px-6 py-8 text-sm leading-6"
            style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}
          >
            GitHub is connected, but no repositories are available yet. Update repository access in
            your GitHub App installation settings, then refresh.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(70,69,84,0.12)" }}>
                  {["Repository", "Account", "Visibility"].map((col) => (
                    <th
                      key={col}
                      className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{
                        color: "var(--on-surface-variant)",
                        fontFamily: "var(--font-space-grotesk)",
                      }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {repositories.map((repo) => (
                  <tr
                    key={repo.repoId}
                    style={{ borderBottom: "1px solid rgba(70,69,84,0.08)" }}
                  >
                    <td className="px-6 py-3.5">
                      <span
                        className="text-sm font-medium"
                        style={{ color: "var(--on-surface)", fontFamily: "var(--font-geist-mono)" }}
                      >
                        {repo.fullName}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className="text-sm"
                        style={{
                          color: "var(--on-surface-variant)",
                          fontFamily: "var(--font-space-grotesk)",
                        }}
                      >
                        {repo.accountLogin}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className="inline-flex items-center gap-1.5 text-xs font-semibold"
                        style={{
                          color: "var(--on-surface-variant)",
                          fontFamily: "var(--font-space-grotesk)",
                        }}
                      >
                        {repo.private ? (
                          <>
                            <Lock className="h-3.5 w-3.5" aria-hidden />
                            Private
                          </>
                        ) : (
                          <>
                            <Globe className="h-3.5 w-3.5" aria-hidden />
                            Public
                          </>
                        )}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
