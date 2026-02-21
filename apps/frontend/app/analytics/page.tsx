import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { MetricsKPIGrid } from "@/components/analytics/metrics-kpi-grid";
import { AgentPerformance } from "@/components/analytics/agent-performance";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { EmailVerificationBanner } from "@/components/EmailVerificationBanner";
import { ChartAreaInteractive } from "@/components/analytics/chart-area-interactive";
import { ChartPieLegend } from "@/components/analytics/chart-pie-legend";

export default function AnalyticsPage() {
  return (
    <ProtectedRoute>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="floating" />
        <SidebarInset>
          <SiteHeader title="Analytics" />
          <EmailVerificationBanner />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 md:py-12 lg:px-8">
                  <div className="flex flex-col gap-6">
                    {/* KPI Grid */}
                    <MetricsKPIGrid />

                    {/* Resume Trend Chart */}
                    <ChartAreaInteractive />

                    {/* Agent Performance & Status Distribution */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                      <div className="lg:col-span-2">
                        <AgentPerformance />
                      </div>
                      <div className="lg:col-span-1">
                        <ChartPieLegend />
                      </div>
                    </div>
                  </div>
                </main>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
