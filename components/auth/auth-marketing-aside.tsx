"use client";

import { usePathname } from "next/navigation";
import { Braces, BarChart2, ShieldCheck, Check } from "lucide-react";

export function AuthMarketingAside() {
  const pathname = usePathname() ?? "";
  const isRegister = pathname.startsWith("/register");

  if (isRegister) return <RegisterMarketingAside />;
  return <LoginPipelineAside />;
}

function LoginPipelineAside() {
  return (
    <div
      className="hidden lg:flex flex-1 min-w-0 min-h-0 relative overflow-hidden items-center justify-center border-l self-stretch"
      style={{
        background: "var(--surface)",
        borderColor: "rgba(70, 69, 84, 0.1)",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 60% 40%, rgba(99,102,241,0.18) 0%, transparent 65%)",
        }}
      />

      <div className="relative z-10 w-full min-w-0 max-w-sm px-6 lg:px-8 flex flex-col gap-6">
        <AnnotationCard
          icon={<Braces size={18} strokeWidth={2} />}
          label="Parse"
          code="ast_tree.build(source)"
          color="var(--primary)"
          colorBg="rgba(99,102,241,0.1)"
        />
        <AnnotationCard
          icon={<BarChart2 size={18} strokeWidth={2} />}
          label="Analyze"
          code="ml_model.evaluate(complexity)"
          color="var(--tertiary)"
          colorBg="rgba(255,183,131,0.1)"
          offset="ml-12"
        />
        <AnnotationCard
          icon={<ShieldCheck size={18} strokeWidth={2} />}
          label="Score"
          code="A+ Grade · 98% Confidence"
          color="var(--on-secondary-container)"
          colorBg="rgba(178,179,242,0.1)"
        />
      </div>
    </div>
  );
}

/** Stitch registration screen — right pane only (Platform Update + headline + features + social proof). */
function RegisterMarketingAside() {
  const features = [
    {
      title: "Security Analysis",
      body: "Detect vulnerabilities and credential leaks in real-time as you commit.",
    },
    {
      title: "Performance Insights",
      body: "Identify slow paths and memory hogs before they impact your users.",
    },
    {
      title: "AI-Powered Suggestions",
      body: "Context-aware refactoring advice powered by our LangGraph evaluation pipeline.",
    },
  ];

  return (
    <div
      className="hidden lg:flex flex-1 min-w-0 relative overflow-hidden flex-col border-l min-h-0 self-stretch"
      style={{
        background: "var(--surface)",
        borderColor: "rgba(70, 69, 84, 0.12)",
      }}
    >
      <div
        aria-hidden
        className="absolute inset-0 z-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, var(--outline-variant) 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 right-0 w-[500px] h-[500px] rounded-full z-0 -translate-y-1/2 translate-x-1/4"
        style={{ background: "rgba(192, 193, 255, 0.05)", filter: "blur(100px)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full z-0 translate-y-1/4 -translate-x-1/4"
        style={{ background: "rgba(73, 75, 214, 0.06)", filter: "blur(120px)" }}
      />

      <div className="relative z-10 flex flex-col flex-1 min-h-0 min-w-0 max-w-lg w-full mx-auto px-8 lg:px-12 py-12 lg:py-16">
        <div className="flex-1 flex flex-col justify-center gap-0 min-h-0">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full w-fit mb-8 border"
            style={{
              background: "var(--surface-highest)",
              borderColor: "rgba(70, 69, 84, 0.15)",
            }}
          >
            <span
              className="w-2 h-2 rounded-full shrink-0 animate-pulse"
              style={{ background: "var(--primary)", boxShadow: "0 0 8px rgba(192,193,255,0.5)" }}
            />
            <span
              className="text-[10px] uppercase tracking-widest text-primary"
              style={{ fontFamily: "var(--font-geist-mono)" }}
            >
              Platform Update
            </span>
          </div>

          <h2
            className="text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight mb-12 break-words"
            style={{
              fontFamily: "var(--font-geist-sans)",
              letterSpacing: "-0.03em",
              color: "var(--on-surface)",
            }}
          >
            Catch issues before they reach production
          </h2>

          <ul className="space-y-6 list-none p-0 m-0">
            {features.map(({ title, body }) => (
              <li key={title} className="flex items-start gap-4">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border"
                  style={{
                    background: "var(--surface-high)",
                    borderColor: "rgba(70, 69, 84, 0.2)",
                    boxShadow: "0 10px 20px rgba(99,102,241,0.05)",
                  }}
                >
                  <Check className="size-3.5 text-primary" aria-hidden strokeWidth={2.5} />
                </div>
                <div className="min-w-0">
                  <h3
                    className="font-semibold text-base mb-1"
                    style={{
                      fontFamily: "var(--font-geist-sans)",
                      letterSpacing: "-0.02em",
                      color: "var(--on-surface)",
                    }}
                  >
                    {title}
                  </h3>
                  <p
                    className="text-sm break-words"
                    style={{ fontFamily: "var(--font-inter)", color: "var(--on-surface-variant)" }}
                  >
                    {body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="shrink-0 pt-12 mt-auto">
          <div
            className="inline-flex items-center gap-3 px-4 py-2 rounded-lg border w-fit"
            style={{
              background: "var(--surface-low)",
              borderColor: "rgba(70, 69, 84, 0.1)",
            }}
          >
            <div className="flex -space-x-2">
              {["CL", "JB", "+5"].map((t) => (
                <div
                  key={t}
                  className="w-6 h-6 rounded-full border flex items-center justify-center text-[8px] font-medium"
                  style={{
                    background: "var(--surface-highest)",
                    borderColor: "var(--surface)",
                    color: "var(--on-surface)",
                    fontFamily: "var(--font-geist-mono)",
                  }}
                >
                  {t}
                </div>
              ))}
            </div>
            <span className="text-xs" style={{ fontFamily: "var(--font-geist-mono)", color: "var(--on-surface-variant)" }}>
              1,200+ evaluations run this week
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnnotationCard({
  icon,
  label,
  code,
  color,
  colorBg,
  offset = "",
}: {
  icon: React.ReactNode;
  label: string;
  code: string;
  color: string;
  colorBg: string;
  offset?: string;
}) {
  return (
    <div
      className={`glass-panel min-w-0 max-w-full overflow-hidden rounded-2xl p-5 flex items-center gap-4 ${offset}`}
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <span
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: colorBg, color }}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p
          className="text-xs font-semibold leading-snug mb-1"
          style={{ color, fontFamily: "var(--font-space-grotesk)" }}
        >
          {label}
        </p>
        <code
          className="text-[11px] sm:text-xs leading-relaxed block break-all"
          style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-geist-mono)" }}
        >
          {code}
        </code>
      </div>
    </div>
  );
}
