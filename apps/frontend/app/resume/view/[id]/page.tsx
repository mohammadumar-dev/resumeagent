"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { AppSidebar } from "@/components/app-sidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ResumeViewer } from "@/components/resume/resume-viewer";
import { SiteHeaderResume } from "@/components/resume/site-header-resume";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { resumeApi } from "@/lib/api/resume";
import BlueResumeViewer from "@/components/resume/blue-resume-viewer";

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
          <SiteHeaderResume />
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
          mb-10
          flex flex-col gap-6
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
                        {/* Left Section */}
                        <div className="space-y-1">
                          <h2 className="text-lg font-semibold tracking-tight">
                            Resume Preview
                          </h2>
                          <p className="text-xs text-muted-foreground">
                            Switch templates instantly. Download in your selected style.
                          </p>
                        </div>

                        {/* Right Section */}
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                          {/* Template Switcher */}
                          <div
                            className="
              inline-flex
              rounded-full
              border border-border/60
              bg-background/70
              backdrop-blur-md
              p-1
              shadow-sm
            "
                          >
                            <button
                              onClick={() => setSelectedTemplate("default")}
                              className={`
                rounded-full
                px-5
                py-2
                text-sm
                font-medium
                transition-all
                duration-200
                w-full
                ${selectedTemplate === "default"
                                  ? "bg-primary text-primary-foreground shadow-sm"
                                  : "text-muted-foreground hover:text-foreground"
                                }
              `}
                            >
                              Default
                            </button>

                            <button
                              onClick={() => setSelectedTemplate("blue")}
                              className={`
                rounded-full
                px-5
                py-2
                text-sm
                font-medium
                transition-all
                duration-200
                w-full
                ${selectedTemplate === "blue"
                                  ? "bg-primary text-primary-foreground shadow-sm"
                                  : "text-muted-foreground hover:text-foreground"
                                }
              `}
                            >
                              Blue
                            </button>
                          </div>

                          {/* Download Button */}
                          <button
                            onClick={handleDownload}
                            disabled={isDownloading}
                            className="
              group
              relative
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-full
              px-6
              py-2.5
              text-sm
              font-medium
              bg-primary
              text-primary-foreground
              shadow-[0_8px_25px_-8px_rgba(0,0,0,0.35)]
              transition-all
              duration-200
              hover:shadow-[0_12px_35px_-10px_rgba(0,0,0,0.45)]
              active:scale-[0.97]
              disabled:opacity-60
              disabled:cursor-not-allowed
            "
                          >
                            {isDownloading ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Downloading...
                              </>
                            ) : (
                              "Download Resume"
                            )}
                          </button>
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