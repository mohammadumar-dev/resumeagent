"use client";

import * as React from "react";
import { Loader2, RefreshCw, Sparkles } from "lucide-react";
import Link from "next/link";
import { resumeApi } from "@/lib/api/resume";
import type { ResumeListAllResponse, ResumeListItem } from "@/types/resume";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function formatDateTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

function StatusBadge({ status }: { status: ResumeListItem["status"] }) {
  const styles =
    status === "ACTIVE"
      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_20px_-6px_rgba(16,185,129,0.4)]"
      : status === "ARCHIVED"
        ? "bg-muted/60 border-border text-muted-foreground"
        : "bg-primary/10 border-primary/20 text-primary shadow-[0_0_20px_-6px_rgba(59,130,246,0.4)]";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border backdrop-blur-sm ${styles}`}
    >
      {status}
    </span>
  );
}


export function ResumeListTable() {
  const [data, setData] = React.useState<ResumeListAllResponse | null>(null);
  const [page, setPage] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await resumeApi.listAll({ page, size: 20, sort: "createdAt,desc" });
      setData(response);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to load resumes.";
      setError(message);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  React.useEffect(() => {
    void load();
  }, [load]);

  return (
    <Card
      className="
relative
overflow-hidden
rounded-3xl
border border-border/60
bg-background/70
backdrop-blur-xl
shadow-[0_25px_80px_-25px_rgba(0,0,0,0.35)]
transition-all duration-300
"
    >
      {/* subtle glass highlight */}
      <div
        aria-hidden
        className="
      pointer-events-none
      absolute
      inset-0
      rounded-3xl
      bg-gradient-to-br
      from-primary/5
      via-transparent
      to-transparent
    "
      />
      <CardHeader className="relative gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <CardTitle className="text-xl font-semibold tracking-tight">
            Generated resumes
          </CardTitle>
          <CardDescription className="text-sm">
            Recently generated resumes sorted by creation date.
          </CardDescription>
        </div>

        {/* Action Group */}
        <div className="flex flex-wrap items-center gap-3">

          {/* Generate New Resume */}
          <Button
            asChild
            size="sm"
            className="
        group
        h-9
        rounded-full
        px-5
        gap-2
        bg-primary/90
        text-primary-foreground
        shadow-[0_8px_25px_-8px_rgba(0,0,0,0.35)]
        transition-all
        hover:bg-primary
        hover:shadow-[0_12px_35px_-10px_rgba(0,0,0,0.45)]
        active:scale-[0.97]
      "
          >
            <Link href="/resume/generate" className="flex items-center">
              <Sparkles className="size-4 transition-transform duration-200 group-hover:rotate-12" />
              <span className="text-sm font-medium tracking-tight">
                Generate with AI
              </span>
            </Link>
          </Button>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => void load()}
            disabled={isLoading}
            className="
        group
        h-9
        rounded-full
        px-4
        backdrop-blur-md
        bg-background/60
        transition-all
        active:scale-[0.97]
      "
          >
            {isLoading ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 size-4 transition-transform duration-200 group-hover:rotate-90" />
            )}
            Refresh
          </Button>

        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {error ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        <div
          className="
    relative
    overflow-hidden
    rounded-3xl
    border border-border/60
    bg-background/60
    backdrop-blur-xl
    shadow-[0_25px_70px_-20px_rgba(0,0,0,0.35)]
    transition-all
  "
        >
          {/* Subtle glass highlight layer */}
          <div
            aria-hidden
            className="
      pointer-events-none
      absolute
      inset-0
      rounded-3xl
      bg-gradient-to-br
      from-primary/5
      via-transparent
      to-transparent
    "
          />

          {/* Header */}
          <div className="relative hidden md:grid grid-cols-12 gap-4 border-b border-border/60 px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <div className="col-span-4">Role & Company</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Created</div>
            <div className="col-span-2">Updated</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {/* Rows */}
          <div className="relative divide-y divide-border/50">
            {isLoading && !data ? (
              <div className="py-20 text-center text-muted-foreground">
                <Loader2 className="mx-auto mb-3 h-5 w-5 animate-spin" />
                Loading resumes...
              </div>
            ) : data?.items?.length ? (
              data.items.map((item) => (
                <div
                  key={item.id}
                  className="
            group
            relative
            grid
            grid-cols-1
            gap-6
            px-6 py-6
            transition-all duration-300
            md:grid-cols-12 md:items-center
          "
                >
                  {/* Soft hover glass wash */}
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
                  </div>

                  {/* ROLE & COMPANY */}
                  <div className="relative md:col-span-4">
                    <h3 className="text-base font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">
                      {item.jobTitle}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.companyName ?? "—"}
                    </p>
                  </div>

                  {/* STATUS */}
                  <div className="relative md:col-span-2 flex md:justify-start">
                    <StatusBadge status={item.status} />
                  </div>

                  {/* CREATED */}
                  <div className="relative md:col-span-2">
                    <div className="flex items-center justify-between md:block">
                      <span className="text-xs font-medium text-muted-foreground md:hidden">
                        Created
                      </span>
                      <span className="text-sm text-muted-foreground tabular-nums">
                        {formatDateTime(item.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* UPDATED */}
                  <div className="relative md:col-span-2">
                    <div className="flex items-center justify-between md:block">
                      <span className="text-xs font-medium text-muted-foreground md:hidden">
                        Updated
                      </span>
                      <span className="text-sm text-muted-foreground tabular-nums">
                        {formatDateTime(item.updatedAt)}
                      </span>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="relative md:col-span-2 flex md:justify-end">
                    <Link href={`/resume/view/${item.id}`}>
                      <Button
                        size="sm"
                        className="
                  h-9
                  rounded-full
                  px-5
                  bg-primary/90
                  text-primary-foreground
                  shadow-[0_8px_25px_-10px_rgba(0,0,0,0.35)]
                  backdrop-blur-md
                  transition-all
                  duration-200
                  hover:bg-primary
                  hover:shadow-[0_12px_35px_-12px_rgba(0,0,0,0.45)]
                  active:scale-[0.97]
                "
                      >
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center text-muted-foreground">
                No resumes found.
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground tabular-nums">
            {data
              ? `Page ${data.page + 1} of ${Math.max(
                data.totalPages,
                1
              )} • ${data.totalElements} total`
              : ""}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={isLoading || !data || !data.hasPrevious}
              className="rounded-full px-4"
            >
              Previous
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={isLoading || !data || !data.hasNext}
              className="rounded-full px-4"
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}