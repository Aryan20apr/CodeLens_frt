import Link from "next/link";
import { BugPlay } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <section
        className="w-full max-w-lg rounded-2xl border px-8 py-10 text-center shadow-2xl"
        style={{
          background: "var(--surface-container)",
          borderColor: "var(--outline-variant)",
        }}
      >
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: "rgba(191, 165, 255, 0.12)" }}>
          <BugPlay size={24} style={{ color: "var(--primary)" }} aria-hidden />
        </div>
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: "var(--on-surface)", fontFamily: "var(--font-geist-sans)" }}
        >
          Page not found
        </h1>
        <p
          className="mt-3 text-sm leading-6"
          style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}
        >
          The page you&apos;re looking for does not exist or has not been implemented yet.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="btn-primary inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Back to home
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold"
            style={{
              background: "var(--surface-low)",
              color: "var(--on-surface)",
              fontFamily: "var(--font-space-grotesk)",
            }}
          >
            Open dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
