import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { EmailVerificationBanner } from "@/components/EmailVerificationBanner";
import { SecuritySettings } from "@/components/settings/security-settings";
import { UserDetailsCard } from "@/components/settings/user-details-card";
import { DangerZone } from "@/components/settings/danger-zone";

export default function SettingsPage() {
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
                    <SiteHeader title="Settings" />
                    <EmailVerificationBanner />
                    <div className="flex flex-1 flex-col">
                        <div className="@container/main flex flex-1 flex-col gap-2">
                            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                                <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 md:py-12 lg:px-8">
                                    <UserDetailsCard />
                                    <div className="mt-6">
                                        <SecuritySettings />
                                    </div>
                                    <div className="mt-6">
                                        <DangerZone />
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
