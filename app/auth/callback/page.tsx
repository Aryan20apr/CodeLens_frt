"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { setAuthFromOAuthAccessToken } from "@/lib/auth/session";

function extractAccessTokenFromHash(hash: string): string | null {
  if (!hash.startsWith("#")) return null;
  const params = new URLSearchParams(hash.slice(1));
  const token = params.get("accessToken");
  if (!token || token.trim() === "") return null;
  return token;
}

export default function OAuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const accessToken = extractAccessTokenFromHash(window.location.hash);
    if (!accessToken) {
      router.replace("/login");
      return;
    }

    setAuthFromOAuthAccessToken(accessToken);

    // Remove sensitive fragment from URL so token is not retained in history/address bar.
    const cleanUrl = `${window.location.origin}${window.location.pathname}${window.location.search}`;
    window.history.replaceState(null, "", cleanUrl);

    router.replace("/dashboard");
    router.refresh();
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <section
        className="w-full max-w-md rounded-2xl border px-6 py-8 text-center"
        style={{
          background: "var(--surface-container)",
          borderColor: "var(--outline-variant)",
        }}
      >
        <h1
          className="text-lg font-semibold"
          style={{ color: "var(--on-surface)", fontFamily: "var(--font-geist-sans)" }}
        >
          Completing sign-in
        </h1>
        <p
          className="mt-2 text-sm"
          style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}
        >
          Please wait while we finalize your OAuth session...
        </p>
      </section>
    </main>
  );
}
