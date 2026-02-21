"use client";

import { useEffect, useMemo, useState } from "react";
import { Lightbulb } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { recentActivity, type AcivityListItem } from "@/lib/api/recent-activity";
import type { ApiError } from "@/types/auth";

const statusStyles: Record<"ACTIVE" | "ARCHIVED", string> = {
  ACTIVE: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  ARCHIVED: "bg-slate-500/10 text-slate-500 border-slate-500/20",
};

export function RecentActivity() {
  const [activities, setActivities] = useState<AcivityListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadRecentActivity = async () => {
      try {
        setIsLoading(true);
        const response = await recentActivity.view({ page: 0, size: 20 });
        if (!isMounted) return;

        const filtered = response.items
          .filter((item) => item.status === "ACTIVE" || item.status === "ARCHIVED")
          .slice(0, 3);

        setActivities(filtered);
        setError(null);
      } catch (err) {
        if (!isMounted) return;
        const message = (err as ApiError)?.message || "Failed to load recent activity.";
        setError(message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadRecentActivity();

    return () => {
      isMounted = false;
    };
  }, []);

  const activityContent = useMemo(() => {
    if (isLoading) {
      return <p className="p-5 text-sm text-muted-foreground">Loading recent activity...</p>;
    }

    if (error) {
      return <p className="p-5 text-sm text-destructive">{error}</p>;
    }

    if (activities.length === 0) {
      return (
        <p className="p-5 text-sm text-muted-foreground">
          No Active or Archived activity found.
        </p>
      );
    }

    return activities.map((activity, index) => {
      const status = activity.status === "ACTIVE" ? "ACTIVE" : "ARCHIVED";
      const shouldShowCompany = activity.title !== "Master resume";

      return (
        <div
          key={`${activity.activity}-${activity.time}-${index}`}
          className="
            group
            relative
            flex flex-col gap-4
            p-5
            transition-all duration-300
            hover:bg-muted/40
          "
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-1">
              <h4 className="text-sm font-semibold tracking-tight text-foreground">
                {activity.title ?? "Untitled Role"}
              </h4>
              {shouldShowCompany && (
                <p className="text-xs font-medium text-muted-foreground">
                  {activity.company ?? "Unknown Company"}
                </p>
              )}
            </div>

            <Badge
              variant="outline"
              className={`
                w-fit
                rounded-full
                px-3 py-1
                text-[11px]
                font-medium
                backdrop-blur-sm
                border
                ${statusStyles[status]}
              `}
            >
              {status}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">{activity.time}</span>
            <span className="text-[11px] text-muted-foreground">{activity.activity}</span>
          </div>
        </div>
      );
    });
  }, [activities, error, isLoading]);

  return (
    <div className="flex flex-col gap-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold tracking-tight">
          Recent Activity
        </h3>
        <Link
          href="/activity"
          className="text-sm font-medium text-primary hover:opacity-80 transition-opacity"
        >
          View All
        </Link>
      </div>

      {/* Glass Container */}
      <Card className="
        relative
        overflow-hidden
        border
        bg-card/70
        backdrop-blur-xl
        shadow-sm
      ">

        <div className="divide-y">
          {activityContent}
        </div>
      </Card>

      {/* Pro Tip */}
      <Card
        className="
          relative
          overflow-hidden
          border
          bg-primary/5
          backdrop-blur-md
          shadow-sm
        "
      >
        <div className="flex gap-4 p-5">

          <div className="
            flex size-10 shrink-0 items-center justify-center
            rounded-lg
            bg-primary/10
            text-primary
          ">
            <Lightbulb className="size-5" />
          </div>

          <div>
            <h4 className="mb-1 text-sm font-semibold">
              Pro Tip
            </h4>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Resumes with quantifiable metrics (e.g., &quot;Increased sales by 20%&quot;)
              are 40% more likely to pass ATS scans. Update your Master Profile
              to include measurable achievements.
            </p>
          </div>
        </div>
      </Card>

    </div>
  );
}
