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
import { Edit, Edit2, Edit2Icon, Edit3, Loader2, Sparkles } from "lucide-react";
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
                                    <div className="mb-8 flex flex-col items-end gap-3 sm:flex-row sm:items-center sm:justify-end">
                                        {/* Regenerate with AI */}
                                        <Button
                                            asChild
                                            variant="outline"
                                            className="
      group
      relative
      h-10
      rounded-full
      px-6
      border-border/60
      bg-background/60
      text-foreground
      shadow-sm
      transition-all
      duration-200
      hover:border-primary/30
      hover:bg-primary/5
      hover:shadow-md
      active:scale-[0.98]
    "
                                        >
                                            <Link href="/master-resume/regenerate" className="flex items-center">
                                                <Sparkles
                                                    className="
          mr-2
          size-4
          text-primary
          transition-transform
          duration-200
          group-hover:rotate-6
        "
                                                />
                                                <span className="text-sm font-medium tracking-tight">
                                                    Regenerate with AI
                                                </span>
                                            </Link>
                                        </Button>

                                        {/* Edit Master Resume */}
                                        <Button
                                            asChild
                                            className="
      group
      relative
      h-10
      rounded-full
      px-6
      bg-primary/90
      text-primary-foreground
      shadow-[0_8px_25px_-8px_rgba(0,0,0,0.35)]
      transition-all
      duration-200
      hover:bg-primary
      hover:shadow-[0_12px_35px_-10px_rgba(0,0,0,0.45)]
      active:scale-[0.98]
    "
                                        >
                                            <Link href="/master-resume/edit" className="flex items-center">
                                                <Edit3
                                                    className="
          mr-2
          size-4
          transition-transform
          duration-200
          group-hover:rotate-6
        "
                                                />
                                                <span className="text-sm font-medium tracking-tight">
                                                    Edit master resume
                                                </span>
                                            </Link>
                                        </Button>

                                    </div>
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
