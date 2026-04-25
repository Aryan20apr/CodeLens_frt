"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as Checkbox from "@radix-ui/react-checkbox";
import * as Label from "@radix-ui/react-label";
import { Check, Loader2, AlertCircle } from "lucide-react";
import { PasswordInput } from "@/components/auth/password-input";
import { setAuthFromLogin } from "@/lib/auth/session";
import { loginUser, LoginApiError } from "@/lib/auth/login-user";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [password, setPassword] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") || "").trim();
    if (!email) {
      setError("Please enter your email.");
      return;
    }
    if (password.length === 0) {
      setError("Please enter your password.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await loginUser({ email, password });
      setAuthFromLogin(res);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      if (err instanceof LoginApiError) {
        setError(err.message);
        return;
      }
      setError("Something went wrong. Try again in a moment.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border px-3.5 py-2.5 text-sm"
          style={{
            background: "rgba(255,90,100,0.08)",
            borderColor: "rgba(255,90,100,0.35)",
            color: "var(--on-surface)",
            fontFamily: "var(--font-space-grotesk)",
          }}
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--error)" }} aria-hidden />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label.Root
            htmlFor="email"
            className="text-sm font-medium"
            style={{ color: "var(--on-surface)", fontFamily: "var(--font-space-grotesk)" }}
          >
            Email
          </Label.Root>
          <input
            id="email"
            name="email"
            type="email"
            required
            disabled={isSubmitting}
            placeholder="you@example.com"
            autoComplete="email"
            className="rounded-lg px-4 py-3 text-sm outline-none transition-colors w-full disabled:opacity-60"
            style={{
              background: "var(--surface-container)",
              color: "var(--on-surface)",
              fontFamily: "var(--font-space-grotesk)",
              border: "1px solid transparent",
            }}
            onFocus={(e) => {
              e.currentTarget.style.background = "var(--surface-high)";
              e.currentTarget.style.border = "1px solid rgba(192,193,255,0.2)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.background = "var(--surface-container)";
              e.currentTarget.style.border = "1px solid transparent";
            }}
          />
        </div>

        <PasswordInput
          id="password"
          name="password"
          label="Password"
          placeholder="••••••••"
          autoComplete="current-password"
          value={password}
          onChange={(ev) => setPassword(ev.currentTarget.value)}
          disabled={isSubmitting}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox.Root
              id="remember"
              name="remember"
              className="w-4 h-4 rounded flex items-center justify-center outline-none"
              style={{ background: "var(--surface-container)", border: "1px solid var(--outline-variant)" }}
            >
              <Checkbox.Indicator>
                <Check size={12} style={{ color: "var(--primary)" }} />
              </Checkbox.Indicator>
            </Checkbox.Root>
            <Label.Root
              htmlFor="remember"
              className="text-xs cursor-pointer"
              style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}
            >
              Remember me
            </Label.Root>
          </div>
          <Link
            href="#"
            className="text-xs transition-opacity hover:opacity-70"
            style={{ color: "var(--primary)", fontFamily: "var(--font-space-grotesk)" }}
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          className="btn-primary w-full py-3 rounded-lg text-sm font-semibold mt-1 flex items-center justify-center gap-2"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
          disabled={isSubmitting}
        >
          {isSubmitting && <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />}
          {isSubmitting ? "Signing in…" : "Sign In"}
        </button>
      </form>

      <p
        className="text-sm text-center"
        style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}
      >
        No account?{" "}
        <Link href="/register" className="font-semibold" style={{ color: "var(--primary)" }}>
          Create one
        </Link>
      </p>
    </>
  );
}
