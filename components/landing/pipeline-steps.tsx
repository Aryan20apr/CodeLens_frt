const STEPS = [
  {
    n: "1",
    title: "Paste or Connect",
    description: "Drop snippets directly into the editor or securely link your GitHub repo.",
  },
  {
    n: "2",
    title: "AI Analysis Engine",
    description: "Our LangGraph agents parse the AST and evaluate against known heuristics.",
  },
  {
    n: "3",
    title: "Actionable Report",
    description: "Receive a detailed score, inline suggestions, and refactoring strategies.",
  },
];

export function PipelineSteps() {
  return (
    <section
      id="pipeline"
      className="py-24 relative overflow-hidden scroll-mt-24"
      style={{ background: "var(--surface)" }}
    >
      <div
        aria-hidden
        className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none"
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="mb-16 text-center mx-auto flex flex-col items-center">
          <h2
            className="text-3xl md:text-4xl font-bold mb-4 text-white"
            style={{ fontFamily: "var(--font-geist-sans)", letterSpacing: "-0.02em" }}
          >
            The Evaluation Pipeline
          </h2>
          <p className="text-lg max-w-2xl text-[#d1d5db] mx-auto" style={{ fontFamily: "var(--font-inter)" }}>
            From raw source to actionable intelligence in seconds.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-start justify-between gap-8 md:gap-4 relative">
          <div className="hidden md:block absolute top-6 left-[10%] right-[10%] h-px bg-white/10 z-0" aria-hidden>
            <div className="absolute top-0 left-0 h-full bg-primary/30 w-1/3" />
          </div>

          {STEPS.map(({ n, title, description }) => (
            <div
              key={n}
              className="relative z-10 flex flex-col md:items-center md:text-center w-full md:w-1/3 mt-8 first:mt-0 md:mt-0"
            >
              <div
                className="w-12 h-12 rounded-full bg-white/5 border-2 border-white/10 flex items-center justify-center mb-6 text-primary font-bold text-lg"
                style={{ fontFamily: "var(--font-geist-sans)" }}
              >
                {n}
              </div>
              <h4
                className="text-lg font-semibold mb-2 text-white"
                style={{ fontFamily: "var(--font-geist-sans)", letterSpacing: "-0.02em" }}
              >
                {title}
              </h4>
              <p className="text-sm text-[#d1d5db] md:max-w-xs" style={{ fontFamily: "var(--font-inter)" }}>
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
