"use client";

import Link from "next/link";
import * as Checkbox from "@radix-ui/react-checkbox";
import * as Label from "@radix-ui/react-label";
import { Check } from "lucide-react";
import { PasswordInput } from "@/components/auth/password-input";

export function RegisterForm() {
  return (
    <>
      <form className="flex flex-col gap-4" action="#" method="POST">
        <div className="grid grid-cols-2 gap-3">
          <TextInput id="firstName" name="firstName" label="First name" placeholder="Aryan" autoComplete="given-name" />
          <TextInput id="lastName" name="lastName" label="Last name" placeholder="Singh" autoComplete="family-name" />
        </div>

        <TextInput id="email" name="email" type="email" label="Email" placeholder="you@example.com" autoComplete="email" />

        <PasswordInput
          id="password"
          name="password"
          label="Password"
          placeholder="Create a password"
          autoComplete="new-password"
        />

        <PasswordStrength />

        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm password"
          placeholder="Repeat password"
          autoComplete="new-password"
        />

        <div className="flex items-start gap-2.5">
          <Checkbox.Root
            id="terms"
            name="terms"
            required
            className="w-4 h-4 rounded flex-shrink-0 flex items-center justify-center outline-none mt-0.5"
            style={{ background: "var(--surface-container)", border: "1px solid var(--outline-variant)" }}
          >
            <Checkbox.Indicator>
              <Check size={12} style={{ color: "var(--primary)" }} />
            </Checkbox.Indicator>
          </Checkbox.Root>
          <Label.Root
            htmlFor="terms"
            className="text-xs leading-relaxed cursor-pointer"
            style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}
          >
            I agree to the{" "}
            <Link href="#" className="underline underline-offset-2" style={{ color: "var(--primary)" }}>
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="#" className="underline underline-offset-2" style={{ color: "var(--primary)" }}>
              Privacy Policy
            </Link>
          </Label.Root>
        </div>

        <button
          type="submit"
          className="btn-primary w-full py-3 rounded-lg text-sm font-semibold mt-1"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          Create Account
        </button>
      </form>

      <p className="text-sm text-center mt-8" style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}>
        Already have an account?{" "}
        <Link href="/login" className="font-semibold" style={{ color: "var(--primary)" }}>
          Sign in
        </Link>
      </p>
    </>
  );
}

function TextInput({
  id, name, type = "text", label, placeholder, autoComplete,
}: {
  id: string; name: string; type?: string; label: string; placeholder: string; autoComplete?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label.Root
        htmlFor={id}
        className="text-sm font-medium"
        style={{ color: "var(--on-surface)", fontFamily: "var(--font-space-grotesk)" }}
      >
        {label}
      </Label.Root>
      <input
        id={id} name={name} type={type} placeholder={placeholder}
        autoComplete={autoComplete} required
        className="w-full rounded-lg px-4 py-3 text-sm outline-none transition-colors"
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
  );
}

function PasswordStrength() {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full"
            style={{ background: i <= 2 ? "var(--tertiary)" : "var(--surface-highest)" }}
          />
        ))}
      </div>
      <span className="text-xs" style={{ color: "var(--tertiary)", fontFamily: "var(--font-space-grotesk)" }}>
        Fair password
      </span>
    </div>
  );
}
