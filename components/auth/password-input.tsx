"use client";

import { useState } from "react";
import * as Label from "@radix-ui/react-label";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps {
  id: string;
  name: string;
  placeholder?: string;
  label: string;
  autoComplete?: string;
}

export function PasswordInput({
  id,
  name,
  placeholder = "Enter password",
  label,
  autoComplete = "current-password",
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <Label.Root
        htmlFor={id}
        className="text-sm font-medium"
        style={{ color: "var(--on-surface)", fontFamily: "var(--font-space-grotesk)" }}
      >
        {label}
      </Label.Root>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required
          className="w-full rounded-lg px-4 py-3 text-sm pr-11 outline-none transition-colors"
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
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
          style={{ color: "var(--on-surface-variant)" }}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}
