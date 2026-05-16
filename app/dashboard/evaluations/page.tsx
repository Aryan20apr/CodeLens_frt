import type { Metadata } from "next";
import { CodeReviewWorkspace } from "@/components/dashboard/code-review-workspace";

export const metadata: Metadata = { title: "Evaluations" };

export default function EvaluationsPage() {
  return <CodeReviewWorkspace />;
}

