"use client";

import { usePathname } from "next/navigation";
import { Topbar } from "@/components/dashboard/topbar";

export function DashboardMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showTopbar = pathname === "/dashboard";

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {showTopbar && <Topbar />}
      <main
        className="flex min-h-0 flex-1 flex-col overflow-y-auto px-8 py-6"
        style={{ background: "var(--surface)" }}
      >
        {children}
      </main>
    </div>
  );
}
