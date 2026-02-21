"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Edit3, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { AppSidebar } from "@/components/app-sidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ResumeViewer } from "@/components/resume/resume-viewer";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { resumeApi } from "@/lib/api/resume";
import BlueResumeViewer from "@/components/resume/blue-resume-viewer";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";


export default function ViewResumePage() {
  const params = useParams();
  const resumeId = useMemo(() => {
    const raw = (params as Record<string, string | string[] | undefined>)?.id;
    return Array.isArray(raw) ? raw[0] : raw;
  }, [params]);

  type ResumeData = Parameters<typeof ResumeViewer>[0]["resumeData"];
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<"default" | "blue">("default");
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      await toast.promise(resumeApi.remove(resumeId), {
        loading: "Deleting resume...",
        success: (res) => res.message || "Resume deleted successfully.",
        error: (err) =>
          err?.message || "Failed to delete resume.",
      });

      setIsDeleteOpen(false);
      router.push("/resume");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownload = () => {
    if (!resumeId) return;

    const endpoint =
      selectedTemplate === "default"
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/resume/${resumeId}/green/download`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/resume/${resumeId}/blue/download`;

    window.open(endpoint, "_blank");
  };


  useEffect(() => {
    if (!resumeId) return;

    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await resumeApi.view(resumeId);
        if (cancelled) return;
        setResumeData(res.resumeJson as ResumeData);
      } catch (e: unknown) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load resume.");
        setResumeData(null);
      } finally {
        if (cancelled) return;
        setIsLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [resumeId]);

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
          <SiteHeader title="View Resume" />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <main className="relative mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 md:py-12 lg:px-8">
                  {/* Soft background glow */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-transparent"
                  />

                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center gap-4 py-28 text-muted-foreground">
                      <Loader2 className="h-7 w-7 animate-spin" />
                      <p className="text-sm">Loading resume preview...</p>
                    </div>
                  ) : error ? (
                    <div className="rounded-2xl border border-red-500/30 bg-red-500/5 px-6 py-4 text-sm text-red-600 backdrop-blur-md">
                      {error}
                    </div>
                  ) : resumeData ? (
                    <>
                      {/* CONTROLS PANEL */}
                      <div
                        className="
    relative
    mb-12
    flex flex-col gap-6
    rounded-3xl
    border border-border/60
    bg-background/70
    backdrop-blur-xl
    p-6 sm:p-8
    shadow-[0_25px_70px_-20px_rgba(0,0,0,0.35)]
    lg:flex-row
    lg:items-center
    lg:justify-between
  "
                      >
                        {/* Glass highlight */}
                        <div
                          aria-hidden
                          className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/5 via-transparent to-transparent"
                        />

                        {/* LEFT SECTION */}
                        <div className="relative space-y-2">
                          <h2 className="text-lg sm:text-xl font-semibold tracking-tight">
                            Resume Preview
                          </h2>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Switch templates instantly. Download in your selected style.
                          </p>
                        </div>

                        {/* RIGHT SECTION */}
                        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">

                          {/* TEMPLATE SWITCHER — Neutral Capsule */}
                          <div
                            className="
    grid
    grid-cols-2
    w-full
    sm:w-auto
    rounded-full
    border border-border/60
    bg-background/80
    backdrop-blur-md
    p-1
    shadow-sm
  "
                          >
                            <button
                              onClick={() => setSelectedTemplate("default")}
                              className={`
      w-full
      rounded-full
      px-4 sm:px-5
      py-2
      text-sm
      font-medium
      text-center
      transition-all
      duration-200
      ${selectedTemplate === "default"
                                  ? "bg-muted text-foreground shadow-sm"
                                  : "text-muted-foreground hover:text-foreground"
                                }
    `}
                            >
                              Default
                            </button>

                            <button
                              onClick={() => setSelectedTemplate("blue")}
                              className={`
      w-full
      rounded-full
      px-4 sm:px-5
      py-2
      text-sm
      font-medium
      text-center
      transition-all
      duration-200
      ${selectedTemplate === "blue"
                                  ? "bg-muted text-foreground shadow-sm"
                                  : "text-muted-foreground hover:text-foreground"
                                }
    `}
                            >
                              Blue
                            </button>
                          </div>

                          {/* DOWNLOAD — Action Accent */}
                          <button
                            onClick={handleDownload}
                            disabled={isDownloading}
                            className="
        group
        inline-flex
        items-center
        justify-center
        gap-2
        rounded-full
        px-6
        py-2.5
        text-sm
        font-medium
        border border-primary/30
        bg-primary/10
        text-primary
        backdrop-blur-md
        transition-all
        duration-200
        hover:bg-primary/20
        hover:border-primary/40
        active:scale-[0.97]
        disabled:opacity-50
      "
                          >
                            {isDownloading ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Downloading...
                              </>
                            ) : (
                              <>
                                Download
                              </>
                            )}
                          </button>

                          {/* EDIT — Primary Structural Action */}
                          <Button
                            asChild
                            className="
        group
        h-10
        rounded-full
        px-7
        bg-primary
        text-primary-foreground
        shadow-[0_12px_35px_-10px_rgba(0,0,0,0.45)]
        transition-all
        duration-200
        hover:shadow-[0_18px_45px_-15px_rgba(0,0,0,0.55)]
        active:scale-[0.97]
      "
                          >
                            <Link
                              href={`/resume/edit/${resumeId}`}
                              className="flex items-center"
                            >
                              <Edit3 className="mr-2 size-4 transition-transform duration-200 group-hover:rotate-6" />
                              <span className="text-sm font-medium">
                                Edit Resume
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
                                <DialogTitle>Delete Resume?</DialogTitle>
                                <DialogDescription>
                                  This action cannot be undone. Your resume will be permanently deleted.
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
                      {/* RESUME CONTAINER */}
                      <div
                        className="
          relative
          overflow-hidden
          rounded-3xl
          border border-border/60
          bg-background/60
          backdrop-blur-xl
          shadow-[0_30px_80px_-20px_rgba(0,0,0,0.35)]
          transition-all
        "
                      >
                        <div
                          aria-hidden
                          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent"
                        />

                        <div className="relative p-6 sm:p-10">
                          {selectedTemplate === "default" ? (
                            <ResumeViewer resumeData={resumeData} />
                          ) : (
                            <BlueResumeViewer resumeData={resumeData} />
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="rounded-2xl border border-border/60 bg-muted/20 px-6 py-5 text-sm text-muted-foreground backdrop-blur-md">
                      Resume not found.
                    </div>
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