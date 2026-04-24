"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { Upload, Play } from "lucide-react";

const LANGUAGES = ["TypeScript", "Python", "Go"] as const;
type Lang = (typeof LANGUAGES)[number];

const PLACEHOLDER: Record<Lang, string> = {
  TypeScript: "function evaluateCode(code: string) {\n  // Paste your code here...\n}",
  Python:     "def evaluate_code(code: str):\n    # Paste your code here...\n    pass",
  Go:         "func EvaluateCode(code string) {\n\t// Paste your code here...\n}",
};

export function CodeEditor() {
  return (
    <Tabs.Root defaultValue="TypeScript">
      <div
        className="rounded-2xl overflow-hidden flex flex-col"
        style={{ background: "var(--surface-lowest)", boxShadow: "var(--shadow-card)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ background: "var(--surface-low)" }}
        >
          {/* Language tabs */}
          <Tabs.List className="flex gap-1" aria-label="Programming language">
            {LANGUAGES.map((lang) => (
              <Tabs.Trigger
                key={lang}
                value={lang}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors outline-none"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
                data-tab={lang}
              >
                {lang}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="p-1.5 rounded-lg transition-opacity hover:opacity-70"
              style={{ color: "var(--on-surface-variant)" }}
              title="Upload file"
            >
              <Upload size={14} />
            </button>

            <button
              type="button"
              className="btn-primary flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              <Play size={12} fill="currentColor" />
              Run Evaluation
            </button>
          </div>
        </div>

        {/* Tab panels — each has its own textarea */}
        {LANGUAGES.map((lang) => (
          <Tabs.Content key={lang} value={lang} className="outline-none">
            <textarea
              rows={8}
              spellCheck={false}
              placeholder={PLACEHOLDER[lang]}
              className="w-full resize-none p-5 text-sm leading-[1.7] outline-none bg-transparent"
              style={{
                color: "var(--on-surface)",
                fontFamily: "var(--font-geist-mono)",
                caretColor: "var(--primary)",
              }}
            />
          </Tabs.Content>
        ))}
      </div>

      {/* Radix tab active state via CSS */}
      <style>{`
        [data-tab] { color: var(--on-surface-variant); background: transparent; }
        [data-state="active"][data-tab] { color: var(--primary); background: var(--surface-container); }
      `}</style>
    </Tabs.Root>
  );
}
