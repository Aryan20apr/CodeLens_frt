"use client";

import Link from "next/link";
import * as Checkbox from "@radix-ui/react-checkbox";
import * as Label from "@radix-ui/react-label";
import { Check } from "lucide-react";
import { PasswordInput } from "@/components/auth/password-input";

export function LoginForm() {
  return (
    <>
      <form className="flex flex-col gap-4" action="#" method="POST">
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
            placeholder="you@example.com"
            autoComplete="email"
            className="rounded-lg px-4 py-3 text-sm outline-none transition-colors"
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
          className="btn-primary w-full py-3 rounded-lg text-sm font-semibold mt-1"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          Sign In
        </button>
      </form>

      <p className="text-sm text-center" style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}>
        No account?{" "}
        <Link href="/register" className="font-semibold" style={{ color: "var(--primary)" }}>
          Create one
        </Link>
      </p>
    </>
  );
}
