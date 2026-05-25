import type { Metadata } from "next";
import { Suspense } from "react";
import { GithubPrDiffPage } from "@/components/dashboard/github-pr-diff-page";

export const metadata: Metadata = { title: "Pull request diff" };

interface PageProps {
  params: Promise<{ repoId: string; pullNumber: string }>;
}

export default async function GithubPullDiffPage({ params }: PageProps) {
  const { repoId, pullNumber } = await params;
  return (
    <Suspense fallback={null}>
      <GithubPrDiffPage repoId={repoId} pullNumber={pullNumber} />
    </Suspense>
  );
}
