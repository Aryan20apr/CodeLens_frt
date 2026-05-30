"use client";

import type { ReactNode } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { Columns2, Rows3 } from "lucide-react";
import "./pr-diff-view.css";

export type DiffViewType = "unified" | "split";

const OPTIONS: { value: DiffViewType; label: string; icon: ReactNode }[] = [
  { value: "unified", label: "Unified", icon: <Rows3 size={14} aria-hidden /> },
  { value: "split", label: "Split", icon: <Columns2 size={14} aria-hidden /> },
];

interface DiffViewToggleProps {
  value: DiffViewType;
  onChange: (value: DiffViewType) => void;
}

export function DiffViewToggle({ value, onChange }: DiffViewToggleProps) {
  return (
    <Tabs.Root
      value={value}
      onValueChange={(next) => {
        if (next === "unified" || next === "split") onChange(next);
      }}
    >
      <Tabs.List
        className="inline-flex gap-1 rounded-lg p-1"
        aria-label="Diff layout"
        style={{ background: "var(--surface-high)", border: "1px solid rgba(70,69,84,0.45)" }}
      >
        {OPTIONS.map(({ value: optionValue, label, icon }) => (
          <Tabs.Trigger
            key={optionValue}
            value={optionValue}
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors outline-none"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
            data-diff-view={optionValue}
          >
            {icon}
            {label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
    </Tabs.Root>
  );
}

export function parseDiffViewType(value: string | null): DiffViewType {
  return value === "split" ? "split" : "unified";
}
