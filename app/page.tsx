import Link from "next/link";
import { BugPlay, Code2 } from "lucide-react";
import { RouteGuard } from "@/components/auth/route-guard";
import { Hero } from "@/components/landing/hero";
import { StatsBar } from "@/components/landing/stats-bar";
import { FeaturesGrid } from "@/components/landing/features-grid";
import { PipelineSteps } from "@/components/landing/pipeline-steps";
import { ResourceStrip } from "@/components/landing/resource-strip";

const NAV = [
  { label: "Features", href: "#features" },
  { label: "Docs", href: "#docs" },
  { label: "Pricing", href: "#pricing" },
  { label: "Blog", href: "#blog" },
] as const;

export default function LandingPage() {
  return (
    <RouteGuard mode="guest-only">
    <>
      <header
        className="sticky top-0 inset-x-0 z-50 w-full border-b border-white/5 backdrop-blur-xl transition-colors"
        style={{
          background: "rgba(10, 10, 11, 0.8)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
        }}
      >
        <div className="flex items-center justify-between px-6 py-4 max-w-screen-2xl mx-auto">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tighter flex items-center gap-2 text-white"
            style={{ fontFamily: "var(--font-geist-sans)", letterSpacing: "-0.02em" }}
          >
            <BugPlay className="size-7 text-primary shrink-0" aria-hidden />
            CodeLens
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium tracking-tight" aria-label="Primary">
            {NAV.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="text-[#e5e1e4] hover:text-primary transition-colors duration-200"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3 md:gap-4">
            <Link
              href="/login"
              className="hidden sm:inline text-sm font-medium tracking-tight px-4 py-2 rounded-lg text-white hover:text-primary transition-colors duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="btn-primary text-sm font-medium tracking-tight px-5 py-2.5 rounded-lg flex items-center gap-2"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <Hero />
        <StatsBar />
        <FeaturesGrid />
        <PipelineSteps />
        <ResourceStrip />

        <section
          id="cta"
          className="px-6 py-24 text-center border-t border-white/5"
          style={{ background: "var(--surface-container)" }}
        >
          <h2
            className="text-3xl lg:text-4xl font-bold tracking-tight mb-4 text-white"
            style={{ fontFamily: "var(--font-geist-sans)", letterSpacing: "-0.02em" }}
          >
            Ready to evaluate your code?
          </h2>
          <p className="text-base mb-8 text-[#d1d5db]" style={{ fontFamily: "var(--font-inter)" }}>
            Join 1,200+ developers building better, safer software with CodeLens.
          </p>
          <Link
            href="/register"
            className="btn-primary inline-flex items-center gap-2 px-8 py-4 rounded-lg text-base font-semibold"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Start for Free — No Credit Card
          </Link>
        </section>
      </main>

      <footer className="w-full py-12 bg-[#070708] border-t border-white/5">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 max-w-7xl mx-auto gap-6">
          <div
            className="font-bold text-[#e5e1e4] flex items-center gap-2"
            style={{ fontFamily: "var(--font-geist-sans)", letterSpacing: "-0.02em" }}
          >
            <BugPlay className="size-4 text-primary shrink-0" aria-hidden />
            CodeLens
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#d1d5db] hover:text-white transition-colors opacity-80 hover:opacity-100"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            <Code2 className="size-3.5 shrink-0" aria-hidden />
            GitHub
          </a>
          <p
            className="text-xs uppercase tracking-widest text-[#d1d5db] text-center md:text-right"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            © {new Date().getFullYear()} CODELENS
          </p>
        </div>
      </footer>
    </>
    </RouteGuard>
  );
}
