import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

import { AnalyticsOverview } from "@/components/dashboard/analytics-overview";
import { MasterResumeCard } from "@/components/dashboard/master-resume-card";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { WelcomeHero } from "@/components/dashboard/welcome-hero";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { EmailVerificationBanner } from "@/components/EmailVerificationBanner";

export default function DashboardPage() {
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
          <SiteHeader title="Dashboard" />
          <EmailVerificationBanner />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 md:py-12 lg:px-8">
                  <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Left Column: Hero & Master Resume (2/3 on large screens) */}
                    <div className="flex flex-col gap-8 lg:col-span-2">
                      <WelcomeHero />
                      <MasterResumeCard />
                    </div>
                    {/* Right Column: Recent Activity (1/3 on large screens) */}
                    <div className="lg:col-span-1">
                      <RecentActivity />
                    </div>
                  </div>
                  {/* Analytics Overview - Full Width */}
                  <AnalyticsOverview />
                </main>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
