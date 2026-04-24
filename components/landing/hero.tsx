import Link from "next/link";
import { ArrowRight, Code2, PlayCircle } from "lucide-react";

function CodeSample() {
  return (
    <pre
      className="overflow-x-auto p-6 text-sm leading-relaxed font-[family-name:var(--font-space-grotesk)]"
      style={{ color: "var(--on-surface-variant)" }}
    >
      <code>
        <span style={{ color: "var(--primary)" }}>import</span> {"{ Injectable } "}
        <span style={{ color: "var(--primary)" }}>from</span> {"'@nestjs/common';\n"}
        <span style={{ color: "var(--primary)" }}>import</span> {"{ JwtService } "}
        <span style={{ color: "var(--primary)" }}>from</span> {"'@nestjs/jwt';\n"}
        <span style={{ color: "var(--primary)" }}>import</span> *{" "}
        <span style={{ color: "var(--primary)" }}>as</span> bcrypt{" "}
        <span style={{ color: "var(--primary)" }}>from</span> {"'bcrypt';\n\n"}
        <span style={{ color: "var(--tertiary)" }}>@Injectable()</span>
        {"\n"}
        <span style={{ color: "var(--primary)" }}>export</span>{" "}
        <span style={{ color: "var(--primary)" }}>class</span>{" "}
        <span style={{ color: "var(--primary-container)" }}>AuthService</span> {"{\n"}
        {"  "}
        <span style={{ color: "var(--primary)" }}>constructor</span>(
        {"\n    "}
        <span style={{ color: "var(--primary)" }}>private</span> usersService: UsersService,
        {"\n    "}
        <span style={{ color: "var(--primary)" }}>private</span> jwtService: JwtService
        {"\n  ) {}\n\n"}
        {"  "}
        <span style={{ color: "var(--primary)" }}>async</span>{" "}
        <span style={{ color: "var(--secondary)" }}>validateUser</span>(username:{" "}
        <span style={{ color: "var(--primary)" }}>string</span>, pass:{" "}
        <span style={{ color: "var(--primary)" }}>string</span>):{" "}
        <span style={{ color: "var(--primary)" }}>Promise</span>
        {"<any> {\n"}
        {"    "}
        <span style={{ color: "var(--primary)" }}>const</span> user ={" "}
        <span style={{ color: "var(--primary)" }}>await</span>{" "}
        <span style={{ color: "var(--primary)" }}>this</span>.usersService.findOne(username);
        {"\n    "}
        <span style={{ color: "var(--surface-variant)" }}>
          {"/* AI Suggestion: Use constant time comparison for passwords */"}
        </span>
        {"\n    "}
        <span style={{ color: "var(--primary)" }}>if</span> (user &amp;&amp;{" "}
        <span style={{ color: "var(--primary)" }}>await</span> bcrypt.compare(pass, user.password)) {"{\n"}
        {"      "}
        <span style={{ color: "var(--primary)" }}>const</span> {"{ password, ...result } = user;\n"}
        {"      "}
        <span style={{ color: "var(--primary)" }}>return</span> result;
        {"\n    }\n"}
        {"    "}
        <span style={{ color: "var(--primary)" }}>return</span>{" "}
        <span style={{ color: "var(--primary)" }}>null</span>;
        {"\n  }\n}"}
      </code>
    </pre>
  );
}

export function Hero() {
  return (
    <section
      id="hero"
      className="relative pt-24 pb-32 px-6 lg:px-8 max-w-7xl mx-auto w-full flex flex-col items-center text-center scroll-mt-24"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full -z-10"
        style={{ background: "rgba(192, 193, 255, 0.1)", filter: "blur(80px)" }}
      />

      <h1
        className="text-5xl md:text-7xl font-extrabold tracking-tighter max-w-4xl leading-tight mb-6 text-white"
        style={{ fontFamily: "var(--font-geist-sans)", letterSpacing: "-0.02em" }}
      >
        AI-Powered Code Evaluation,{" "}
        <span
          className="bg-clip-text text-transparent"
          style={{
            backgroundImage: "linear-gradient(135deg, #c0c1ff, #818cf8)",
          }}
        >
          Instantly.
        </span>
      </h1>

      <p
        className="text-lg md:text-xl max-w-2xl mb-10 leading-relaxed text-[#d1d5db]"
        style={{ fontFamily: "var(--font-inter)" }}
      >
        Paste your code or connect your GitHub repository. Get immediate security, performance, and
        quality analysis powered by our advanced LangGraph AI pipeline.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4 mb-16 w-full justify-center">
        <Link
          href="/register"
          className="btn-primary w-full sm:w-auto font-semibold px-8 py-4 rounded-lg flex items-center justify-center gap-2 text-sm"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          Start Evaluating Free
          <ArrowRight className="size-4 shrink-0" aria-hidden />
        </Link>
        <Link
          href="#pipeline"
          className="ghost-border w-full sm:w-auto text-primary font-medium px-8 py-4 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors hover:bg-white/5"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          <PlayCircle className="size-4 shrink-0" aria-hidden />
          View Demo
        </Link>
      </div>

      {/* Code preview — Stitch layout: floating score + editor chrome */}
      <div className="relative w-full max-w-3xl mx-auto text-left group">
        <div
          className="absolute -top-6 -right-6 md:-right-8 z-10 rounded-full p-4 flex flex-col items-center justify-center border transition-transform hover:scale-110 cursor-default glass-panel"
          style={{
            borderColor: "rgba(192, 193, 255, 0.2)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div className="relative w-16 h-16 rounded-full border-4 flex items-center justify-center" style={{ borderColor: "var(--surface-low)" }}>
            <svg className="absolute inset-0 w-full h-full -rotate-90 text-primary" viewBox="0 0 36 36" aria-hidden>
              <path
                className="stroke-current opacity-30"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                strokeWidth="3"
              />
              <path
                className="stroke-current"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                strokeDasharray="92, 100"
                strokeWidth="3"
              />
            </svg>
            <span
              className="relative text-xl font-bold text-primary"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              92
            </span>
          </div>
          <span
            className="text-[10px] uppercase tracking-wider mt-1 text-[#e5e1e4]"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Score
          </span>
        </div>

        <div
          className="rounded-lg overflow-hidden ghost-border transition-transform group-hover:-translate-y-1"
          style={{
            background: "var(--surface-lowest)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/5">
            <div className="flex gap-2">
              <span className="w-3 h-3 rounded-full bg-[var(--surface-variant)]" />
              <span className="w-3 h-3 rounded-full bg-[var(--surface-variant)]" />
              <span className="w-3 h-3 rounded-full bg-[var(--surface-variant)]" />
            </div>
            <div
              className="text-xs flex items-center gap-2 text-[#d1d5db]"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              <Code2 className="size-3.5 shrink-0 opacity-80" aria-hidden />
              auth.service.ts
            </div>
          </div>
          <CodeSample />
        </div>
      </div>
    </section>
  );
}
