"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { tryRefreshSession } from "@/lib/auth/refresh-session";
import { getAuthResolutionState, setAuthResolutionState } from "@/lib/auth/auth-resolution";
import { CODELENS_AUTH_CHANGE_EVENT, getAuthSession, setAuthFromLogin } from "@/lib/auth/session";

interface RouteGuardProps {
  mode: "protected" | "guest-only";
  children: React.ReactNode;
}

type GuardState = "resolving" | "authed" | "unauthed";

function isSignedIn() {
  return (getAuthSession()?.accessToken ?? "") !== "";
}

export function RouteGuard({ mode, children }: RouteGuardProps) {
  const router = useRouter();
  // Always "resolving" on first paint so SSR and client markup match; auth is resolved in useLayoutEffect.
  const [state, setState] = useState<GuardState>("resolving");

  // Initial resolve: in-memory / session access token, else cookie-based refresh.
  useLayoutEffect(() => {
    const cached = getAuthResolutionState();
    if (cached !== "unknown") {
      setState(cached);
      return;
    }

    if (isSignedIn()) {
      setAuthResolutionState("authed");
      setState("authed");
      return;
    }

    let cancelled = false;
    (async () => {
      const next = await tryRefreshSession();
      if (cancelled) return;
      if (next) {
        setAuthFromLogin(next);
        setAuthResolutionState("authed");
        setState("authed");
      } else {
        setAuthResolutionState("unauthed");
        setState("unauthed");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Same-tab updates (and storage where applicable); keeps redirects consistent after login/logout.
  useEffect(() => {
    function onAuthStateChange() {
      const authed = isSignedIn();
      const next: GuardState = authed ? "authed" : "unauthed";
      setAuthResolutionState(next);
      setState(next);
    }
    function onPageShow() {
      if (isSignedIn()) {
        setAuthResolutionState("authed");
        setState("authed");
      }
    }
    window.addEventListener(CODELENS_AUTH_CHANGE_EVENT, onAuthStateChange);
    window.addEventListener("storage", onAuthStateChange);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      window.removeEventListener(CODELENS_AUTH_CHANGE_EVENT, onAuthStateChange);
      window.removeEventListener("storage", onAuthStateChange);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);

  // Navigation based on mode + state.
  useEffect(() => {
    if (state === "resolving") return;
    if (mode === "protected" && state === "unauthed") {
      router.replace("/login");
    }
    if (mode === "guest-only" && state === "authed") {
      router.replace("/dashboard");
    }
  }, [state, mode, router]);

  if (mode === "protected" && state === "resolving") {
    return <>{children}</>;
  }

  if (state === "resolving" || (mode === "protected" && state === "unauthed")) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <p
          className="text-sm"
          style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}
        >
          {state === "unauthed" && mode === "protected"
            ? "Redirecting to sign in..."
            : "Loading session..."}
        </p>
      </div>
    );
  }

  if (mode === "guest-only" && state === "authed") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <p
          className="text-sm"
          style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}
        >
          Redirecting to dashboard...
        </p>
      </div>
    );
  }

  if (mode === "protected" && state === "authed") {
    return <>{children}</>;
  }

  if (mode === "guest-only" && state === "unauthed") {
    return <>{children}</>;
  }

  return null;
}
