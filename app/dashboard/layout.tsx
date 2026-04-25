import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { RouteGuard } from "@/components/auth/route-guard";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard mode="protected">
      <div className="flex h-screen overflow-hidden" style={{ background: "var(--surface)" }}>
        <Sidebar />

        {/* Main content area */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Topbar />
          <main
            className="flex-1 overflow-y-auto px-8 py-6"
            style={{ background: "var(--surface)" }}
          >
            {children}
          </main>
        </div>
      </div>
    </RouteGuard>
  );
}
