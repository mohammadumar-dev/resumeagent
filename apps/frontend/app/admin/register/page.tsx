"use client";

import { ShieldPlus } from "lucide-react";

import { AppSidebar } from "@/components/app-sidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { EmailVerificationBanner } from "@/components/EmailVerificationBanner";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { RegisterAdminForm } from "@/components/admin/register-admin-form";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminRegisterPage() {
  const { user } = useAuth();

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
          <SiteHeader title="Create Admin" />
          <EmailVerificationBanner />

          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 md:py-12 lg:px-8">
                  {user?.role !== "ADMIN" ? (
                    <Card className="bg-card/70 backdrop-blur-xl">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <ShieldPlus className="h-4 w-4 text-destructive" />
                          Admin access required
                        </CardTitle>
                        <CardDescription>
                          You don&apos;t have permission to create admin accounts.
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  ) : (
                    <RegisterAdminForm />
                  )}
                </main>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}

