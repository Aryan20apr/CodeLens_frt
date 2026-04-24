/** In-page targets for top nav (Stitch wireframe: Features, Docs, Pricing, Blog). */
const BLOCKS = [
  {
    id: "docs" as const,
    title: "Documentation",
    body: "API reference, LangGraph pipeline guides, and integration playbooks ship alongside the product.",
  },
  {
    id: "pricing" as const,
    title: "Pricing",
    body: "Transparent tiers for individuals and teams. Start free, scale when evaluations grow.",
  },
  {
    id: "blog" as const,
    title: "Blog",
    body: "Release notes, security research, and how we ship the evaluation engine.",
  },
];

export function ResourceStrip() {
  return (
    <section className="border-t border-white/5 py-20 px-6 lg:px-8" style={{ background: "var(--surface-lowest)" }}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
        {BLOCKS.map(({ id, title, body }) => (
          <div key={id} id={id} className="scroll-mt-28">
            <h2
              className="text-xl font-bold text-white mb-2"
              style={{ fontFamily: "var(--font-geist-sans)", letterSpacing: "-0.02em" }}
            >
              {title}
            </h2>
            <p className="text-sm leading-relaxed text-[#d1d5db]" style={{ fontFamily: "var(--font-inter)" }}>
              {body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
