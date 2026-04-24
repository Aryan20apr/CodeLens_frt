import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CodeLens — AI Code Evaluator",
    template: "%s | CodeLens",
  },
  description:
    "Paste your code or connect your GitHub repository. Get immediate security, performance, and quality analysis powered by our advanced LangGraph AI pipeline.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={[
        geistSans.variable,
        geistMono.variable,
        inter.variable,
        spaceGrotesk.variable,
        "h-full antialiased",
      ].join(" ")}
    >
      <body
        className="min-h-full flex flex-col"
        style={{ background: "var(--surface)", color: "var(--on-surface)" }}
      >
        {children}
      </body>
    </html>
  );
}
