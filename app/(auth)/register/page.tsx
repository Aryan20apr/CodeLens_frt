import type { Metadata } from "next";
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Create Account" };

export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-7 w-full max-w-sm">
      <div className="flex flex-col gap-2">
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ fontFamily: "var(--font-geist-sans)", color: "var(--on-surface)" }}
        >
          Create your account
        </h1>
        <p className="text-sm" style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}>
          Join the network of developers building better software.
        </p>
      </div>

      <SocialAuthButtons />

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px" style={{ background: "var(--outline-variant)" }} />
        <span className="text-xs" style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}>or</span>
        <div className="flex-1 h-px" style={{ background: "var(--outline-variant)" }} />
      </div>

      <RegisterForm />
    </div>
  );
}
