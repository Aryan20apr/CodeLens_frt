"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as Checkbox from "@radix-ui/react-checkbox";
import * as Label from "@radix-ui/react-label";
import { Check, Loader2, AlertCircle } from "lucide-react";
import { PasswordInput } from "@/components/auth/password-input";
import { setAuthFromRegister } from "@/lib/auth/session";
import { registerUser, RegisterApiError } from "@/lib/auth/register-user";

function buildFullName(first: string, last: string) {
  return [first, last]
    .map((p) => p.trim())
    .filter(Boolean)
    .join(" ");
}

function getPasswordStrength(
  p: string,
): { level: 0 | 1 | 2 | 3 | 4; label: string; tone: string } {
  if (p.length === 0) return { level: 0, label: "Enter a password", tone: "var(--on-surface-variant)" };
  let score = 0;
  if (p.length >= 8) score += 1;
  if (p.length >= 12) score += 1;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score += 1;
  if (/\d/.test(p) || /[^A-Za-z0-9]/.test(p)) score += 1;
  const level = Math.min(4, score) as 0 | 1 | 2 | 3 | 4;
  const labels = ["Use a longer password with mixed characters", "Weak", "Fair", "Good", "Strong"];
  const label = labels[Math.max(0, level)];
  const tones: string[] = [
    "var(--on-surface-variant)",
    "var(--error)",
    "var(--tertiary)",
    "var(--tertiary)",
    "var(--tertiary)",
  ];
  return { level, label, tone: tones[Math.max(0, level)]! };
}

export function RegisterForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const strength = getPasswordStrength(password);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const data = new FormData(form);
    const first = String(data.get("firstName") || "").trim();
    const last = String(data.get("lastName") || "").trim();
    const email = String(data.get("email") || "").trim();
    if (!first || !last) {
      setError("Please enter your first and last name.");
      return;
    }
    if (!email) {
      setError("Please enter your email.");
      return;
    }
    if (!terms) {
      setError("You need to accept the terms to continue.");
      return;
    }
    if (password.length < 8) {
      setError("Use at least 8 characters in your password.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    const name = buildFullName(first, last);
    setIsSubmitting(true);
    try {
      const res = await registerUser({ email, password, name });
      setAuthFromRegister(res);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      if (err instanceof RegisterApiError) {
        if (err.status === 409) {
          setError("That email is already registered. Sign in or use another address.");
        } else {
          setError(err.message);
        }
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

      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-4"
      >
        <div className="grid grid-cols-2 gap-3">
          <TextInput
            id="firstName"
            name="firstName"
            label="First name"
            placeholder="Aryan"
            autoComplete="given-name"
            disabled={isSubmitting}
          />
          <TextInput
            id="lastName"
            name="lastName"
            label="Last name"
            placeholder="Singh"
            autoComplete="family-name"
            disabled={isSubmitting}
          />
        </div>

        <TextInput
          id="email"
          name="email"
          type="email"
          label="Email"
          placeholder="you@example.com"
          autoComplete="email"
          disabled={isSubmitting}
        />

        <PasswordInput
          id="password"
          name="password"
          label="Password"
          placeholder="Create a password"
          autoComplete="new-password"
          value={password}
          onChange={(ev) => setPassword(ev.currentTarget.value)}
          disabled={isSubmitting}
        />

        <PasswordStrength level={strength.level} label={strength.label} tone={strength.tone} />

        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm password"
          placeholder="Repeat password"
          autoComplete="new-password"
          value={confirm}
          onChange={(ev) => {
            setConfirm(ev.currentTarget.value);
          }}
          disabled={isSubmitting}
        />

        <div className="flex items-start gap-2.5">
          <Checkbox.Root
            id="terms"
            name="terms"
            checked={terms}
            onCheckedChange={(c) => setTerms(c === true)}
            className="w-4 h-4 rounded flex-shrink-0 flex items-center justify-center outline-none mt-0.5"
            style={{ background: "var(--surface-container)", border: "1px solid var(--outline-variant)" }}
            disabled={isSubmitting}
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
          className="btn-primary w-full py-3 rounded-lg text-sm font-semibold mt-1 flex items-center justify-center gap-2"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
          disabled={isSubmitting}
        >
          {isSubmitting && <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />}
          {isSubmitting ? "Creating account…" : "Create Account"}
        </button>
      </form>

      <p
        className="text-sm text-center mt-8"
        style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}
      >
        Already have an account?{" "}
        <Link href="/login" className="font-semibold" style={{ color: "var(--primary)" }}>
          Sign in
        </Link>
      </p>
    </>
  );
}

function TextInput({
  id,
  name,
  type = "text",
  label,
  placeholder,
  autoComplete,
  disabled = false,
}: {
  id: string;
  name: string;
  type?: string;
  label: string;
  placeholder: string;
  autoComplete?: string;
  disabled?: boolean;
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
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        disabled={disabled}
        className="w-full rounded-lg px-4 py-3 text-sm outline-none transition-colors disabled:opacity-60"
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

function PasswordStrength({ level, label, tone }: { level: 0 | 1 | 2 | 3 | 4; label: string; tone: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-1" aria-hidden>
        {[1, 2, 3, 4].map((i) => {
          const active = level >= i;
          return (
            <div
              key={i}
              className="h-1 flex-1 rounded-full transition-all duration-300"
              style={{
                background: active
                  ? level <= 1
                    ? "var(--error)"
                    : "var(--tertiary)"
                  : "var(--surface-highest)",
                opacity: active ? 1 : 0.45,
              }}
            />
          );
        })}
      </div>
      <span
        className="text-xs"
        style={{ color: tone, fontFamily: "var(--font-space-grotesk)" }}
        aria-live="polite"
      >
        {label}
      </span>
    </div>
  );
}
