import type { Metadata } from "next";
import { GithubButton } from "@/components/auth/github-button";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Sign In" };

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-8 w-full max-w-sm">
      <div className="flex flex-col gap-2">
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ fontFamily: "var(--font-geist-sans)", color: "var(--on-surface)" }}
        >
          Welcome back
        </h1>
        <p className="text-sm" style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}>
          Sign in to your CodeLens account
        </p>
      </div>

      <GithubButton label="Continue with GitHub" />

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px" style={{ background: "var(--outline-variant)" }} />
        <span className="text-xs" style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}>Or</span>
        <div className="flex-1 h-px" style={{ background: "var(--outline-variant)" }} />
      </div>

      <LoginForm />
    </div>
  );
}
