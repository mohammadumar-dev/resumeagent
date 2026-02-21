"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { EditResumeForm } from "@/components/resume/edit-resume-form";
import { useParams } from "next/navigation";
import { useMemo } from "react";

export default function EditResumePage() {
    const params = useParams();
    const resumeId = useMemo(() => {
        const raw = (params as Record<string, string | string[] | undefined>)?.id;
        return Array.isArray(raw) ? raw[0] : raw;
    }, [params]);
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
                    <SiteHeader title="Edit Resume" />
                    <div className="flex flex-1 flex-col">
                        <div className="@container/main flex flex-1 flex-col gap-2">
                            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                                <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 md:py-12 lg:px-8">
                                    <EditResumeForm resumeId={resumeId ?? ""}/>
                                </main>
                            </div>
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </ProtectedRoute>
    );
}