import type { Metadata } from "next";
import { Suspense } from "react";
import { PrReviewHub } from "@/components/dashboard/pr-review-hub";

export const metadata: Metadata = {
  title: "PR Review | CodeLens",
  description:
    "AI-powered pull request review hub with walkthrough, diff viewer, and review run history.",
};

interface PageProps {
  params: Promise<{ repoId: string; pullNumber: string }>;
}

export default async function GithubPullDiffPage({ params }: PageProps) {
  const { repoId, pullNumber } = await params;
  return (
    <Suspense fallback={null}>
      <PrReviewHub repoId={repoId} pullNumber={pullNumber} />
    </Suspense>
  );
}

