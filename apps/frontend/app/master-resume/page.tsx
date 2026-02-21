"use client";

import Link from "next/link";
import { AppSidebar } from "@/components/app-sidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SiteHeader } from "@/components/site-header";
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
import { Edit3, Loader2, Sparkles, Trash2 } from "lucide-react";
import ViewMasterResume from "@/components/master-resume/view-master-resume";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogFooter, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
export default function MasterResumePage() {

    const [data, setData] = useState<MasterResumeViewResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        try {
            setIsDeleting(true);

            await toast.promise(masterResumeApi.remove(), {
                loading: "Deleting master resume...",
                success: (res) => res.message || "Master resume deleted successfully.",
                error: (err) =>
                    err?.message || "Failed to delete master resume.",
            });

            setIsDeleteOpen(false);
            router.push("/dashboard");
        } finally {
            setIsDeleting(false);
        }
    };


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
                        <SiteHeader title="Master Resume" />
                        <div className="flex flex-1 flex-col">
                            <div className="@container/main flex flex-1 flex-col gap-2">
                                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                                    <main className="relative mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 md:py-16 lg:px-8">

                                        {/* Background Glow */}
                                        <div
                                            aria-hidden
                                            className="
      pointer-events-none
      absolute
      inset-0
      -z-10
      bg-gradient-to-br
      from-primary/5
      via-transparent
      to-transparent
    "
                                        />

                                        <div className="flex min-h-[65vh] items-center justify-center">

                                            <Card
                                                className="
        relative
        w-full
        max-w-2xl
        overflow-hidden
        rounded-3xl
        border border-border/60
        bg-background/70
        backdrop-blur-xl
        p-8 sm:p-10
        shadow-[0_30px_80px_-20px_rgba(0,0,0,0.45)]
        transition-all
      "
                                            >
                                                {/* Subtle Glass Sheen */}
                                                <div
                                                    aria-hidden
                                                    className="
          pointer-events-none
          absolute
          inset-0
          bg-gradient-to-br
          from-primary/5
          via-transparent
          to-transparent
        "
                                                />

                                                <div className="relative space-y-6 text-center sm:text-left">

                                                    <CardHeader className="space-y-3 p-0">
                                                        <CardTitle className="text-2xl sm:text-3xl font-semibold tracking-tight">
                                                            Master resume not found
                                                        </CardTitle>

                                                        <CardDescription className="text-sm leading-relaxed max-w-xl mx-auto sm:mx-0">
                                                            Create your master resume once to unlock personalized resume
                                                            generation, intelligent matching, and streamlined editing.
                                                        </CardDescription>
                                                    </CardHeader>

                                                    <CardContent className="space-y-5 p-0">

                                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                                            Your master resume acts as the foundation for all AI-generated
                                                            job-specific resumes. Add it once, refine anytime.
                                                        </p>

                                                        {/* CTA Row */}
                                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

                                                            <Button
                                                                asChild
                                                                size="lg"
                                                                className="
                h-11
                rounded-full
                px-8
                bg-primary/90
                text-primary-foreground
                shadow-[0_12px_35px_-12px_rgba(0,0,0,0.45)]
                transition-all
                duration-200
                hover:bg-primary
                hover:shadow-[0_18px_45px_-15px_rgba(0,0,0,0.55)]
                active:scale-[0.98]
              "
                                                            >
                                                                <Link href="/master-resume/create">
                                                                    Create master resume
                                                                </Link>
                                                            </Button>

                                                        </div>

                                                    </CardContent>
                                                </div>

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
                    <SiteHeader title="Master Resume" />
                    <div className="flex flex-1 flex-col">
                        <div className="@container/main flex flex-1 flex-col gap-2">
                            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                                <main className="relative mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 md:py-12 lg:px-8">

                                    {/* Soft background glow */}
                                    <div
                                        aria-hidden
                                        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-transparent"
                                    />

                                    {/* ACTION BAR */}
                                    <div
                                        className="
      mb-10
      flex flex-col gap-5
      rounded-3xl
      border border-border/60
      bg-background/60
      backdrop-blur-xl
      p-6
      shadow-[0_20px_60px_-20px_rgba(0,0,0,0.35)]
      lg:flex-row
      lg:items-center
      lg:justify-between
    "
                                    >
                                        {/* Left Label Section */}
                                        <div className="space-y-1">
                                            <h2 className="text-lg font-semibold tracking-tight">
                                                Master Resume
                                            </h2>
                                            <p className="text-xs text-muted-foreground">
                                                Manage, refine, or regenerate your baseline profile.
                                            </p>
                                        </div>

                                        {/* Right Action Buttons */}
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

                                            {/* Regenerate with AI */}
                                            <Button
                                                asChild
                                                variant="outline"
                                                className="
          group
          h-10
          rounded-full
          px-6
          border-border/60
          bg-background/70
          backdrop-blur-md
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
                                                    <Sparkles className="mr-2 size-4 text-primary transition-transform duration-200 group-hover:rotate-6" />
                                                    <span className="text-sm font-medium tracking-tight">
                                                        Regenerate with AI
                                                    </span>
                                                </Link>
                                            </Button>

                                            {/* Edit Master Resume (Primary Action) */}
                                            <Button
                                                asChild
                                                className="
          group
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
                                                    <Edit3 className="mr-2 size-4 transition-transform duration-200 group-hover:rotate-6" />
                                                    <span className="text-sm font-medium tracking-tight">
                                                        Edit Master Resume
                                                    </span>
                                                </Link>
                                            </Button>

                                            {/* Delete (Separated Slightly) */}
                                            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        variant="destructive"
                                                        className="
              h-10
              rounded-full
              px-6
              shadow-sm
              transition-all
              duration-200
              hover:shadow-md
              active:scale-[0.98]
            "
                                                    >
                                                        <Trash2 className="mr-2 size-4" />
                                                        Delete
                                                    </Button>
                                                </DialogTrigger>

                                                <DialogContent className="rounded-2xl backdrop-blur-xl">
                                                    <DialogHeader>
                                                        <DialogTitle>Delete Master Resume?</DialogTitle>
                                                        <DialogDescription>
                                                            This action cannot be undone. Your master resume will be permanently deleted.
                                                        </DialogDescription>
                                                    </DialogHeader>

                                                    <DialogFooter className="gap-2 sm:justify-end">
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => setIsDeleteOpen(false)}
                                                            disabled={isDeleting}
                                                            className="rounded-full"
                                                        >
                                                            Cancel
                                                        </Button>

                                                        <Button
                                                            variant="destructive"
                                                            onClick={handleDelete}
                                                            disabled={isDeleting}
                                                            className="rounded-full"
                                                        >
                                                            {isDeleting ? "Deleting..." : "Yes, Delete"}
                                                        </Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>

                                        </div>
                                    </div>

                                    {/* RESUME CONTENT */}
                                    <div
                                        className="
      relative
      overflow-hidden
      rounded-3xl
      border border-border/60
      bg-background/60
      backdrop-blur-xl
      shadow-[0_30px_80px_-20px_rgba(0,0,0,0.35)]
    "
                                    >
                                        <div
                                            aria-hidden
                                            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent"
                                        />

                                        <div className="relative p-6 sm:p-10">
                                            <ViewMasterResume resume={resume} />
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
