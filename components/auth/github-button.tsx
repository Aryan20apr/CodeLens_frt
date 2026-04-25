"use client";

export function GithubButton({
  label = "Continue with GitHub",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        /* TODO: trigger GitHub OAuth */
      }}
      className={`w-full min-w-0 sm:basis-0 sm:flex-1 flex items-center justify-center gap-2 sm:gap-3 py-3 px-3 sm:px-4 rounded-lg font-semibold text-sm transition-colors ${className}`.trim()}
      style={{
        background: "var(--surface-highest)",
        color: "var(--on-surface)",
        fontFamily: "var(--font-space-grotesk)",
        border: "1px solid rgba(70,69,84,0.3)",
      }}
    >
      {/* GitHub Invertocat mark — brand icon, not available in lucide-react */}
      <GitHubMark />
      {label}
    </button>
  );
}

function GitHubMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.089-.745.083-.73.083-.73 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.776.418-1.305.762-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.468-2.382 1.236-3.222-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.3 1.23a11.5 11.5 0 0 1 3-.404c1.02.005 2.047.138 3 .404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.652.242 2.873.118 3.176.77.84 1.235 1.912 1.235 3.222 0 4.61-2.805 5.625-5.475 5.92.43.37.823 1.1.823 2.22 0 1.604-.015 2.896-.015 3.29 0 .322.216.694.825.576C20.565 21.796 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}
