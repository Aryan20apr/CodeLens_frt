"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  BugPlay,
  Code2,
  FileText,
  GitBranch,
  Settings,
  LogOut,
} from "lucide-react";
import { getAuthSession, clearAuthSession } from "@/lib/auth/session";
import { logoutWithAccessToken } from "@/lib/auth/logout-user";

const NAV_ITEMS = [
  { label: "Dashboard",   href: "/dashboard",            icon: <LayoutDashboard size={18} /> },
  { label: "Evaluations", href: "/dashboard/evaluations", icon: <Code2 size={18} />           },
  { label: "Reports",     href: "/dashboard/reports",     icon: <FileText size={18} />        },
  { label: "GitHub",      href: "/dashboard/github",      icon: <GitBranch size={18} />       },
  { label: "Settings",    href: "/dashboard/settings",    icon: <Settings size={18} />        },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [logoutPending, setLogoutPending] = useState(false);

  async function handleLogout() {
    if (logoutPending) return;
    setLogoutPending(true);
    const session = getAuthSession();
    try {
      if (session?.accessToken) {
        await logoutWithAccessToken(session.accessToken);
      }
    } catch {
      // Still clear local session if the request fails
    } finally {
      clearAuthSession();
      setLogoutPending(false);
      router.push("/login");
      router.refresh();
    }
  }

  return (
    <aside
      className="flex flex-col w-60 flex-shrink-0 h-full py-6"
      style={{ background: "var(--surface-low)" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 mb-8">
        <BugPlay size={20} style={{ color: "var(--primary)" }} />
        <span
          className="font-bold text-sm tracking-tight"
          style={{ fontFamily: "var(--font-geist-sans)", color: "var(--on-surface)" }}
        >
          CodeLens
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 px-3 flex-1">
        {NAV_ITEMS.map(({ label, href, icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
              style={{
                background: active ? "var(--surface-container)" : "transparent",
                color: active ? "var(--primary)" : "var(--on-surface-variant)",
                fontFamily: "var(--font-space-grotesk)",
              }}
            >
              <span style={{ color: active ? "var(--primary)" : "var(--on-surface-variant)" }}>
                {icon}
              </span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User avatar stub */}
      <div className="px-5 pt-4 flex items-center gap-3" style={{ borderTop: "1px solid rgba(70,69,84,0.15)" }}>
        <span
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
          style={{ background: "var(--gradient-primary)", color: "var(--on-primary)", fontFamily: "var(--font-space-grotesk)" }}
        >
          A
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <span
            className="text-xs font-semibold truncate"
            style={{ color: "var(--on-surface)", fontFamily: "var(--font-space-grotesk)" }}
          >
            Aryan Singh
          </span>
          <span className="text-xs" style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}>Pro Plan</span>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          disabled={logoutPending}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ color: "var(--on-surface-variant)" }}
          title="Log out"
          aria-label="Log out"
        >
          <LogOut size={16} className={logoutPending ? "animate-pulse" : ""} />
        </button>
      </div>
    </aside>
  );
}
