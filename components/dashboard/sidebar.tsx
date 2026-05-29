"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useState, useSyncExternalStore } from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import {
  LayoutDashboard,
  BugPlay,
  Code2,
  FileText,
  GitBranch,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { getAuthSession, clearAuthSession } from "@/lib/auth/session";
import { logoutWithAccessToken } from "@/lib/auth/logout-user";

const SIDEBAR_COLLAPSED_KEY = "codelens-sidebar-collapsed";

const sidebarCollapsedListeners = new Set<() => void>();

function readSidebarCollapsed(): boolean {
  return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true";
}

function subscribeSidebarCollapsed(onStoreChange: () => void) {
  sidebarCollapsedListeners.add(onStoreChange);
  return () => sidebarCollapsedListeners.delete(onStoreChange);
}

function setSidebarCollapsed(collapsed: boolean) {
  localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(collapsed));
  for (const listener of sidebarCollapsedListeners) {
    listener();
  }
}

function useSidebarCollapsed() {
  const collapsed = useSyncExternalStore(
    subscribeSidebarCollapsed,
    readSidebarCollapsed,
    () => false,
  );
  const toggle = useCallback(() => setSidebarCollapsed(!collapsed), [collapsed]);
  return { collapsed, toggle };
}

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Evaluations", href: "/dashboard/evaluations", icon: Code2 },
  { label: "Reports", href: "/dashboard/reports", icon: FileText },
  { label: "GitHub", href: "/dashboard/github", icon: GitBranch },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [logoutPending, setLogoutPending] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const { collapsed, toggle } = useSidebarCollapsed();

  async function handleLogout() {
    if (logoutPending) return;
    setLogoutDialogOpen(false);
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
      className={`flex h-full flex-shrink-0 flex-col py-6 transition-[width] duration-200 ease-in-out ${
        collapsed ? "w-[4.5rem]" : "w-60"
      }`}
      style={{ background: "var(--surface-low)" }}
      aria-label="Dashboard navigation"
    >
      {/* Logo + collapse toggle */}
      <div
        className={`mb-8 flex px-3 ${collapsed ? "flex-col items-center gap-3" : "items-center gap-2 px-5"}`}
      >
        <div className={`flex items-center gap-2 ${collapsed ? "justify-center" : "min-w-0 flex-1"}`}>
          <BugPlay size={20} style={{ color: "var(--primary)" }} className="shrink-0" />
          {!collapsed && (
            <span
              className="truncate font-bold text-sm tracking-tight"
              style={{ fontFamily: "var(--font-geist-sans)", color: "var(--on-surface)" }}
            >
              CodeLens
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={toggle}
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors hover:opacity-90 ${
            collapsed ? "" : "ml-auto"
          }`}
          style={{ color: "var(--on-surface-variant)" }}
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      {/* Nav */}
      <nav className={`flex flex-1 flex-col gap-1 ${collapsed ? "px-2" : "px-3"}`}>
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active =
            pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={`flex items-center rounded-lg py-2.5 text-sm font-medium transition-colors ${
                collapsed ? "justify-center px-0" : "gap-3 px-3"
              }`}
              style={{
                background: active ? "var(--surface-container)" : "transparent",
                color: active ? "var(--primary)" : "var(--on-surface-variant)",
                fontFamily: "var(--font-space-grotesk)",
              }}
            >
              <Icon
                size={18}
                className="shrink-0"
                style={{ color: active ? "var(--primary)" : "var(--on-surface-variant)" }}
              />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div
        className={`flex items-center pt-4 ${collapsed ? "flex-col gap-3 px-2" : "gap-3 px-5"}`}
        style={{ borderTop: "1px solid rgba(70,69,84,0.15)" }}
      >
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
          style={{
            background: "var(--gradient-primary)",
            color: "var(--on-primary)",
            fontFamily: "var(--font-space-grotesk)",
          }}
          title="Aryan Singh"
        >
          A
        </span>
        {!collapsed && (
          <div className="flex min-w-0 flex-1 flex-col">
            <span
              className="truncate text-xs font-semibold"
              style={{ color: "var(--on-surface)", fontFamily: "var(--font-space-grotesk)" }}
            >
              Aryan Singh
            </span>
            <span
              className="text-xs"
              style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}
            >
              Pro Plan
            </span>
          </div>
        )}
        <AlertDialog.Root
          open={logoutDialogOpen}
          onOpenChange={(open) => {
            if (!logoutPending) setLogoutDialogOpen(open);
          }}
        >
          <AlertDialog.Trigger asChild>
            <button
              type="button"
              disabled={logoutPending}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ color: "var(--on-surface-variant)" }}
              title="Log out"
              aria-label="Log out"
            >
              <LogOut size={16} className={logoutPending ? "animate-pulse" : ""} />
            </button>
          </AlertDialog.Trigger>
          <AlertDialog.Portal>
            <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-150 data-[state=closed]:opacity-0 data-[state=open]:opacity-100" />
            <AlertDialog.Content
              className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl p-6 shadow-2xl outline-none transition-all duration-150 data-[state=closed]:scale-95 data-[state=closed]:opacity-0 data-[state=open]:scale-100 data-[state=open]:opacity-100"
              style={{
                background: "var(--surface-high)",
                border: "1px solid rgba(144,143,160,0.24)",
                boxShadow: "var(--shadow-float)",
              }}
            >
              <div
                className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl"
                style={{ background: "rgba(255,180,171,0.12)", color: "var(--error)" }}
                aria-hidden="true"
              >
                <LogOut size={20} />
              </div>
              <AlertDialog.Title
                className="text-lg font-bold tracking-tight"
                style={{ color: "var(--on-surface)", fontFamily: "var(--font-geist-sans)" }}
              >
                Log out of CodeLens?
              </AlertDialog.Title>
              <AlertDialog.Description
                className="mt-2 text-sm leading-6"
                style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-inter)" }}
              >
                You will need to sign in again before viewing evaluations, repositories, or reports.
              </AlertDialog.Description>
              <div className="mt-6 flex justify-end gap-3">
                <AlertDialog.Cancel asChild>
                  <button
                    type="button"
                    className="rounded-xl px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90"
                    style={{
                      background: "var(--surface-container)",
                      color: "var(--on-surface)",
                      fontFamily: "var(--font-space-grotesk)",
                    }}
                  >
                    Stay signed in
                  </button>
                </AlertDialog.Cancel>
                <AlertDialog.Action asChild>
                  <button
                    type="button"
                    onClick={() => void handleLogout()}
                    className="rounded-xl px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90"
                    style={{
                      background: "var(--error-container)",
                      color: "var(--error)",
                      fontFamily: "var(--font-space-grotesk)",
                    }}
                  >
                    Log out
                  </button>
                </AlertDialog.Action>
              </div>
            </AlertDialog.Content>
          </AlertDialog.Portal>
        </AlertDialog.Root>
      </div>
    </aside>
  );
}
