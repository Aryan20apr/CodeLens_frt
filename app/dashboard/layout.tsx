import { RouteGuard } from "@/components/auth/route-guard";
import { DashboardMain } from "@/components/dashboard/dashboard-main";
import { Sidebar } from "@/components/dashboard/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard mode="protected">
      <div className="flex h-screen overflow-hidden" style={{ background: "var(--surface)" }}>
        <Sidebar />
        <DashboardMain>{children}</DashboardMain>
      </div>
    </RouteGuard>
  );
}
