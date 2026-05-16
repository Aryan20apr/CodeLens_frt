import Link from "next/link";
import { AlertTriangle, ArrowLeft } from "lucide-react";

export default function DashboardNotFound() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-10">
      <section
        className="w-full max-w-xl rounded-2xl border px-8 py-10 text-center"
        style={{
          background: "var(--surface-container)",
          borderColor: "var(--outline-variant)",
        }}
      >
        <div
          className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl"
          style={{ background: "rgba(191, 165, 255, 0.12)" }}
        >
          <AlertTriangle size={24} style={{ color: "var(--primary)" }} aria-hidden />
        </div>
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: "var(--on-surface)", fontFamily: "var(--font-geist-sans)" }}
        >
          This dashboard page is not ready yet
        </h1>
        <p
          className="mt-3 text-sm leading-6"
          style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}
        >
          The route you opened does not have an implementation yet. Use the main dashboard or evaluations page instead.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/dashboard"
            className="btn-primary inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            <ArrowLeft size={16} aria-hidden />
            Back to dashboard
          </Link>
          <Link
            href="/dashboard/evaluations"
            className="inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold"
            style={{
              background: "var(--surface-low)",
              color: "var(--on-surface)",
              fontFamily: "var(--font-space-grotesk)",
            }}
          >
            Open evaluations
          </Link>
        </div>
      </section>
    </div>
  );
}
