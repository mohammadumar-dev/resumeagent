"use client";

import Link from "next/link";
import { AppSidebar } from "@/components/app-sidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SiteHeaderMasterResume } from "@/components/master-resume/site-header-master-resume";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import type { MasterResumeViewResponse } from "@/types/master-resume";
import { useEffect, useState, type CSSProperties } from "react";
import { masterResumeApi } from "@/lib/api/master-resume";
import { Loader2 } from "lucide-react";
import ViewMasterResume from "@/components/master-resume/view-master-resume";

export default function CreateMasterResumePage() {

    const [data, setData] = useState<MasterResumeViewResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const response = await masterResumeApi.view();
                setData(response);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        load();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin" />
            </div>
        );
    }

    const resume = data?.resumeJson;

    if (!resume) {
        return (

            <ProtectedRoute>
                <SidebarProvider
                    style={
                        {
                            "--sidebar-width": "calc(var(--spacing) * 72)",
                            "--header-height": "calc(var(--spacing) * 12)",
                        } as CSSProperties
                    }
                >
                    <AppSidebar variant="floating" />
                    <SidebarInset>
                        <SiteHeaderMasterResume />
                        <div className="flex flex-1 flex-col">
                            <div className="@container/main flex flex-1 flex-col gap-2">
                                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                                    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 md:py-12 lg:px-8">
                                        <div className="flex min-h-[60vh] items-center justify-center py-20">
                                            <Card className="w-full max-w-xl rounded-3xl border bg-card/70 p-6 shadow-[0_25px_80px_-25px_rgba(0,0,0,0.55)]">
                                                <CardHeader>
                                                    <CardTitle className="text-2xl">
                                                        Master resume not found
                                                    </CardTitle>
                                                    <CardDescription>
                                                        Create your master resume once to unlock the personalized
                                                        view and keep everything in one place.
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent className="space-y-4 py-4">
                                                    <p className="text-sm text-muted-foreground">
                                                        Use the creation form to save your master resume. You can
                                                        update it anytime afterward.
                                                    </p>
                                                    <Button asChild size="lg">
                                                        <Link href="/master-resume/create">
                                                            Create master resume
                                                        </Link>
                                                    </Button>
                                                </CardContent>
                                            </Card>
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

    return (
        <ProtectedRoute>
            <SidebarProvider
                style={
                    {
                        "--sidebar-width": "calc(var(--spacing) * 72)",
                        "--header-height": "calc(var(--spacing) * 12)",
                    } as CSSProperties
                }
            >
                <AppSidebar variant="floating" />
                <SidebarInset>
                    <SiteHeaderMasterResume />
                    <div className="flex flex-1 flex-col">
                        <div className="@container/main flex flex-1 flex-col gap-2">
                            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                                <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 md:py-12 lg:px-8">
                                    <ViewMasterResume resume={resume} />
                                </main>
                            </div>
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </ProtectedRoute>
    );
}
