"use client";

import React, { useMemo } from "react";
import {
  ShieldAlert,
  Zap,
  Sparkles,
  Bug,
  FlaskConical,
  Layers,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

interface FormattedAiSummaryProps {
  text: string;
}

interface ParsedCategory {
  title: string;
  icon: typeof ShieldAlert;
  color: string;
  bgColor: string;
  content: string;
}

const CATEGORY_META: Record<
  string,
  { icon: typeof ShieldAlert; color: string; bgColor: string }
> = {
  security: {
    icon: ShieldAlert,
    color: "var(--tertiary)",
    bgColor: "rgba(255, 183, 131, 0.12)",
  },
  performance: {
    icon: Zap,
    color: "var(--primary)",
    bgColor: "rgba(192, 193, 255, 0.12)",
  },
  "best practices": {
    icon: Sparkles,
    color: "#38bdf8",
    bgColor: "rgba(56, 189, 248, 0.12)",
  },
  architecture: {
    icon: Layers,
    color: "#a78bfa",
    bgColor: "rgba(167, 139, 250, 0.12)",
  },
  testing: {
    icon: FlaskConical,
    color: "#4ade80",
    bgColor: "rgba(74, 222, 128, 0.12)",
  },
  bugs: {
    icon: Bug,
    color: "var(--error)",
    bgColor: "rgba(255, 180, 171, 0.12)",
  },
};

/**
 * Parses bold terms, inline code, and backticks into styled React elements.
 */
function renderInlineText(text: string): React.ReactNode[] {
  // Regex to split inline code `...`, bold **...**, or normal text
  const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);

  return tokens.map((token, idx) => {
    if (token.startsWith("`") && token.endsWith("`") && token.length > 2) {
      const code = token.slice(1, -1);
      return (
        <code
          key={idx}
          className="rounded px-1.5 py-0.5 text-xs font-medium"
          style={{
            background: "var(--surface-high)",
            color: "var(--primary)",
            fontFamily: "var(--font-geist-mono)",
            border: "1px solid rgba(70,69,84,0.3)",
          }}
        >
          {code}
        </code>
      );
    }
    if (token.startsWith("**") && token.endsWith("**") && token.length > 4) {
      const bold = token.slice(2, -2);
      return (
        <strong
          key={idx}
          className="font-semibold"
          style={{ color: "var(--on-surface)" }}
        >
          {bold}
        </strong>
      );
    }
    return <span key={idx}>{token}</span>;
  });
}

export function FormattedAiSummary({ text }: FormattedAiSummaryProps) {
  const { overview, categories } = useMemo(() => {
    let cleanText = text.trim();
    // Remove leading "## Overview" or "## Summary" if present
    cleanText = cleanText.replace(/^##\s*(Overview|Summary)\s*/i, "");

    // Regex to split on category headers like **Security:**, **Performance:**, etc.
    const pattern =
      /\*\*(Security|Performance|Best Practices|Architecture|Testing|Bugs|Bug Fixes|Code Quality):\*\*/gi;

    const matches: { title: string; index: number; length: number }[] = [];
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(cleanText)) !== null) {
      matches.push({
        title: match[1],
        index: match.index,
        length: match[0].length,
      });
    }

    if (matches.length === 0) {
      return { overview: cleanText, categories: [] };
    }

    const firstMatch = matches[0];
    const rawOverview = cleanText.slice(0, firstMatch.index).trim();

    const parsedCats: ParsedCategory[] = [];
    for (let i = 0; i < matches.length; i++) {
      const current = matches[i];
      const nextIndex =
        i + 1 < matches.length ? matches[i + 1].index : cleanText.length;
      const content = cleanText
        .slice(current.index + current.length, nextIndex)
        .trim();

      const key = current.title.toLowerCase();
      const meta = CATEGORY_META[key] ?? {
        icon: AlertTriangle,
        color: "var(--primary)",
        bgColor: "rgba(192, 193, 255, 0.12)",
      };

      parsedCats.push({
        title: current.title,
        icon: meta.icon,
        color: meta.color,
        bgColor: meta.bgColor,
        content,
      });
    }

    return { overview: rawOverview, categories: parsedCats };
  }, [text]);

  return (
    <div className="space-y-4">
      {/* Primary Overview Paragraph */}
      {overview && (
        <p
          className="text-sm leading-relaxed"
          style={{
            color: "var(--on-surface-variant)",
            fontFamily: "var(--font-inter)",
          }}
        >
          {renderInlineText(overview)}
        </p>
      )}

      {/* Category Pills / Callout Sections */}
      {categories.length > 0 && (
        <div className="grid grid-cols-1 gap-3 pt-1">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div
                key={idx}
                className="ghost-border rounded-lg p-3.5"
                style={{
                  background: "var(--surface-container)",
                  borderColor: "rgba(70,69,84,0.3)",
                }}
              >
                <div className="mb-1.5 flex items-center gap-2">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-bold"
                    style={{
                      background: cat.bgColor,
                      color: cat.color,
                      fontFamily: "var(--font-space-grotesk)",
                    }}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    {cat.title}
                  </span>
                </div>
                <p
                  className="text-sm leading-relaxed"
                  style={{
                    color: "var(--on-surface)",
                    fontFamily: "var(--font-inter)",
                  }}
                >
                  {renderInlineText(cat.content)}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
