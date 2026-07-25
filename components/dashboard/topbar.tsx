"use client";

import { useSyncExternalStore } from "react";
import { Plus } from "lucide-react";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function subscribeGreeting(onStoreChange: () => void): () => void {
  const interval = window.setInterval(onStoreChange, 60_000);
  return () => window.clearInterval(interval);
}

export function Topbar() {
  const greeting = useSyncExternalStore(subscribeGreeting, getGreeting, () => "Good morning");

  return (
    <header
      className="flex items-center justify-between px-8 py-5"
      style={{ background: "var(--surface-container)" }}
    >
      <div>
        <h1
          className="text-lg font-bold tracking-tight"
          style={{ fontFamily: "var(--font-geist-sans)", color: "var(--on-surface)" }}
          suppressHydrationWarning
        >
          {greeting}, Aryan
        </h1>
        <p className="text-sm" style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}>
          Here&apos;s your code health overview
        </p>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          className="btn-primary inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          <Plus size={14} />
          New Evaluation
        </button>

        <span
          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={{ background: "var(--gradient-primary)", color: "var(--on-primary)", fontFamily: "var(--font-space-grotesk)" }}
        >
          A
        </span>
      </div>
    </header>
  );
}
