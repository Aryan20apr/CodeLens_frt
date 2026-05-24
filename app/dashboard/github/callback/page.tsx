import type { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { GithubInstallCallback } from "@/components/dashboard/github-install-callback";

export const metadata: Metadata = { title: "GitHub installation" };

function GithubInstallCallbackFallback() {
  return (
    <main className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-6">
      <Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--primary)" }} aria-hidden />
    </main>
  );
}

export default function GithubInstallCallbackPage() {
  return (
    <Suspense fallback={<GithubInstallCallbackFallback />}>
      <GithubInstallCallback />
    </Suspense>
  );
}
