import type { Metadata } from "next";
import { Suspense } from "react";
import { GithubConnectPanel } from "@/components/dashboard/github-connect-panel";

export const metadata: Metadata = { title: "GitHub" };

export default function GithubDashboardPage() {
  return (
    <Suspense fallback={null}>
      <GithubConnectPanel />
    </Suspense>
  );
}
