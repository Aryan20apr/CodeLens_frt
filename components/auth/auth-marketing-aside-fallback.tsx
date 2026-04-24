/** Placeholder while `usePathname` hydrates — keeps flex row from collapsing. */
export function AuthMarketingAsideFallback() {
  return (
    <div
      className="hidden lg:flex flex-1 min-w-0 min-h-0 self-stretch border-l"
      style={{
        background: "var(--surface)",
        borderColor: "rgba(70, 69, 84, 0.1)",
      }}
      aria-hidden
    />
  );
}
