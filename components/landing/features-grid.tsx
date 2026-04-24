import { Shield, Zap, Puzzle } from "lucide-react";

const FEATURES = [
  {
    icon: Shield,
    title: "Security Analysis",
    description:
      "Automatically detect hardcoded secrets, injection vulnerabilities, and weak cryptography implementations in real-time.",
  },
  {
    icon: Zap,
    title: "Performance Insights",
    description:
      "Identify algorithmic bottlenecks, memory leaks, and inefficient database query patterns before they impact users.",
  },
  {
    icon: Puzzle,
    title: "Best Practices",
    description:
      "Enforce team coding standards, identify anti-patterns, and ensure idiomatic usage of your chosen framework or language.",
  },
];

export function FeaturesGrid() {
  return (
    <section id="features" className="py-24 px-6 lg:px-8 max-w-7xl mx-auto w-full scroll-mt-24">
      <div className="mb-16 text-center max-w-3xl mx-auto">
        <h2
          className="text-3xl md:text-4xl font-bold mb-4 text-white"
          style={{ fontFamily: "var(--font-geist-sans)", letterSpacing: "-0.02em" }}
        >
          Deep Insight, Zero Configuration
        </h2>
        <p className="text-lg text-[#d1d5db]" style={{ fontFamily: "var(--font-inter)" }}>
          Our engine parses your syntax and logic to find issues before they hit production.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <article
            key={title}
            className="rounded-lg p-8 ghost-border hover:bg-white/5 transition-colors group bg-[var(--surface-lowest)]"
          >
            <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Icon className="size-7 text-primary" aria-hidden />
            </div>
            <h3
              className="text-xl font-semibold mb-3 text-white"
              style={{ fontFamily: "var(--font-geist-sans)", letterSpacing: "-0.02em" }}
            >
              {title}
            </h3>
            <p className="text-sm leading-relaxed text-[#d1d5db]" style={{ fontFamily: "var(--font-inter)" }}>
              {description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
