import Link from "next/link";
import { Suspense } from "react";
import { BugPlay } from "lucide-react";
import { AuthMarketingAside } from "@/components/auth/auth-marketing-aside";
import { AuthMarketingAsideFallback } from "@/components/auth/auth-marketing-aside-fallback";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex min-w-0 overflow-x-hidden" style={{ background: "var(--surface)" }}>
      <div
        className="flex min-h-screen flex-col w-full min-w-0 shrink-0 px-8 py-12 items-center lg:min-h-0 lg:items-stretch lg:w-[480px] lg:shrink-0 lg:px-14 xl:w-[520px]"
        style={{ background: "var(--surface-low)" }}
      >
        <Link
          href="/"
          className="flex items-center gap-2 mb-12 self-start"
          style={{ color: "var(--on-surface)", textDecoration: "none" }}
        >
          <BugPlay size={20} style={{ color: "var(--primary)" }} />
          <span
            className="font-bold text-base tracking-tight"
            style={{ fontFamily: "var(--font-geist-sans)" }}
          >
            CodeLens
          </span>
        </Link>

        <div className="flex flex-1 w-full max-w-sm flex-col justify-center items-center lg:max-w-none lg:items-stretch">
          {children}
        </div>

        <p
          className="mt-8 w-full max-w-sm text-xs text-center lg:max-w-none"
          style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}
        >
          By signing in you agree to our{" "}
          <Link href="#" className="underline underline-offset-2" style={{ color: "var(--primary)" }}>
            Terms
          </Link>{" "}
          and{" "}
          <Link href="#" className="underline underline-offset-2" style={{ color: "var(--primary)" }}>
            Privacy Policy
          </Link>
        </p>
      </div>

      <Suspense fallback={<AuthMarketingAsideFallback />}>
        <AuthMarketingAside />
      </Suspense>
    </div>
  );
}
