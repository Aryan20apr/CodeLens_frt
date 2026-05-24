"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getAuthSession } from "@/lib/auth/session";
import { clearGithubInstallState, verifyGithubInstallState } from "@/lib/github/install-state";
import { linkGithubInstallation } from "@/lib/github/link-github-installation";
import { GithubInstallApiError, parseInstallationIdFromQuery } from "@/lib/github/github-install";

type CallbackPhase = "working" | "redirecting";

function redirectWithError(router: ReturnType<typeof useRouter>, code: string) {
  router.replace(`/dashboard/github?error=${encodeURIComponent(code)}`);
}

export function GithubInstallCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const started = useRef(false);
  const [phase, setPhase] = useState<CallbackPhase>("working");

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const installationId = parseInstallationIdFromQuery(searchParams.get("installation_id"));
    const state = searchParams.get("state");

    if (installationId == null) {
      clearGithubInstallState();
      redirectWithError(router, "missing_installation");
      return;
    }

    if (!verifyGithubInstallState(state)) {
      clearGithubInstallState();
      redirectWithError(router, "invalid_state");
      return;
    }

    clearGithubInstallState();

    const session = getAuthSession();
    if (!session?.accessToken) {
      router.replace("/login");
      return;
    }

    void (async () => {
      try {
        await linkGithubInstallation({ installationId }, session.accessToken);
        setPhase("redirecting");
        router.replace("/dashboard/github?installed=1");
        router.refresh();
      } catch (err) {
        const code =
          err instanceof GithubInstallApiError && err.status === 401
            ? "unauthenticated"
            : "link_failed";
        redirectWithError(router, code);
      }
    })();
  }, [router, searchParams]);

  return (
    <main className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-6">
      <section
        className="w-full max-w-md rounded-2xl border px-6 py-8 text-center"
        style={{
          background: "var(--surface-container)",
          borderColor: "var(--outline-variant)",
        }}
      >
        <Loader2
          className="mx-auto h-8 w-8 animate-spin"
          style={{ color: "var(--primary)" }}
          aria-hidden
        />
        <h1
          className="mt-4 text-lg font-semibold"
          style={{ color: "var(--on-surface)", fontFamily: "var(--font-geist-sans)" }}
        >
          {phase === "redirecting" ? "GitHub connected" : "Linking GitHub installation"}
        </h1>
        <p
          className="mt-2 text-sm"
          style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}
        >
          {phase === "redirecting"
            ? "Taking you back to your repositories…"
            : "Confirming your GitHub App installation with CodeLens…"}
        </p>
      </section>
    </main>
  );
}
