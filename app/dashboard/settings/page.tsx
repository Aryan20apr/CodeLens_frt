import type { Metadata } from "next";
import { ByokSettings } from "@/components/dashboard/byok-settings";

export const metadata: Metadata = {
  title: "Settings — CodeLens",
  description: "Configure LLM provider keys and active AI model for evaluations and PR reviews.",
};

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8 pb-12 max-w-6xl">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ fontFamily: "var(--font-geist-sans)", color: "var(--on-surface)" }}
        >
          Settings
        </h1>
        <p
          className="text-sm"
          style={{ fontFamily: "var(--font-inter)", color: "var(--on-surface-variant)" }}
        >
          Manage your AI model providers, API credentials, and default evaluation engine.
        </p>
      </div>

      {/* BYOK Settings Component */}
      <ByokSettings />
    </div>
  );
}
