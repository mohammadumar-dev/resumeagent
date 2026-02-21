"use client";

import * as React from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { recentActivity, type AcivityListItem, type RecentActivityResponse } from "@/lib/api/recent-activity";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function StatusBadge({ status }: { status: AcivityListItem["status"] }) {
  const styles =
    status === "ACTIVE"
      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
      : status === "ARCHIVED"
        ? "bg-muted/60 border-border text-muted-foreground"
        : "bg-primary/10 border-primary/20 text-primary";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium backdrop-blur-sm ${styles}`}
    >
      {status}
    </span>
  );
}

export function RecentActivityListTable() {
  const [data, setData] = React.useState<RecentActivityResponse | null>(null);
  const [page, setPage] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await recentActivity.view({ page, size: 10 });
      setData(response);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to load recent activity.";
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
          <CardTitle className="text-xl font-semibold tracking-tight">Recent Activity</CardTitle>
          <CardDescription className="text-sm">
            Your latest activity entries sorted by newest first.
          </CardDescription>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => void load()}
          disabled={isLoading}
          className="group h-9 rounded-full bg-background/60 px-4 backdrop-blur-md transition-all active:scale-[0.97]"
        >
          {isLoading ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 size-4 transition-transform duration-200 group-hover:rotate-90" />
          )}
          Refresh
        </Button>
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

          <div className="relative hidden grid-cols-12 gap-4 border-b border-border/60 px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground md:grid">
            <div className="col-span-4">Title</div>
            <div className="col-span-3">Company</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-3">Time</div>
          </div>

          <div className="relative divide-y divide-border/50">
            {isLoading && !data ? (
              <div className="py-20 text-center text-muted-foreground">
                <Loader2 className="mx-auto mb-3 h-5 w-5 animate-spin" />
                Loading recent activity...
              </div>
            ) : data?.items?.length ? (
              data.items.map((item, index) => (
                <div
                  key={`${item.activity}-${item.time}-${index}`}
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
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
                  </div>

                  <div className="relative md:col-span-4">
                    <h3 className="text-base font-semibold tracking-tight text-foreground">
                      {item.title ?? "Untitled Activity"}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground md:hidden">{item.activity}</p>
                  </div>

                  <div className="relative text-sm text-muted-foreground md:col-span-3">
                    {item.title === "Master resume" ? "-" : (item.company ?? "-")}
                  </div>

                  <div className="relative flex md:col-span-2 md:justify-start">
                    <StatusBadge status={item.status} />
                  </div>

                  <div className="relative md:col-span-3">
                    <div className="flex items-center justify-between md:block">
                      <span className="text-xs font-medium text-muted-foreground md:hidden">Time</span>
                      <span className="text-sm text-muted-foreground">{item.time}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center text-muted-foreground">No recent activity found.</div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm tabular-nums text-muted-foreground">
            {data
              ? `Page ${data.page + 1} of ${Math.max(data.totalPages, 1)} • ${data.totalElements} total`
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
