import { Download, Edit, Eye, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const activities = [
  {
    id: 1,
    title: "Product Manager",
    company: "Stripe",
    status: "ATS-Optimized",
    statusColor: "emerald",
    time: "2 hours ago",
    actions: ["download", "edit"],
  },
  {
    id: 2,
    title: "Senior UX Designer",
    company: "Airbnb",
    status: "Draft",
    statusColor: "amber",
    time: "Yesterday",
    actions: ["edit"],
  },
  {
    id: 3,
    title: "Marketing Lead",
    company: "Spotify",
    status: "Needs Review",
    statusColor: "red",
    time: "3 days ago",
    actions: ["view"],
  },
];

const statusStyles = {
  emerald:
    "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  amber:
    "bg-amber-500/10 text-amber-500 border-amber-500/20",
  red:
    "bg-red-500/10 text-red-500 border-red-500/20",
};

export function RecentActivity() {
  return (
    <div className="flex flex-col gap-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold tracking-tight">
          Recent Activity
        </h3>
        <Link
          href="/dashboard/activity"
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

          {activities.map((activity) => (
            <div
              key={activity.id}
              className="
                group
                relative
                flex flex-col gap-4
                p-5
                transition-all duration-300
                hover:bg-muted/40
              "
            >

              {/* Top Section */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                <div className="flex flex-col gap-1">
                  <h4 className="text-sm font-semibold tracking-tight text-foreground">
                    {activity.title}
                  </h4>
                  <p className="text-xs font-medium text-muted-foreground">
                    {activity.company}
                  </p>
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
                    ${statusStyles[activity.statusColor as keyof typeof statusStyles]}
                  `}
                >
                  {activity.status}
                </Badge>
              </div>

              {/* Bottom Section */}
              <div className="flex items-center justify-between">

                <span className="text-[11px] text-muted-foreground">
                  {activity.time}
                </span>

                <div className="flex items-center gap-2">

                  {activity.actions.includes("download") && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="
                        size-8 rounded-full
                        text-muted-foreground
                        hover:bg-primary/10
                        hover:text-primary
                        transition-colors
                      "
                    >
                      <Download className="size-4" />
                    </Button>
                  )}

                  {activity.actions.includes("edit") && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="
                        size-8 rounded-full
                        text-muted-foreground
                        hover:bg-primary/10
                        hover:text-primary
                        transition-colors
                      "
                    >
                      <Edit className="size-4" />
                    </Button>
                  )}

                  {activity.actions.includes("view") && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="
                        size-8 rounded-full
                        text-muted-foreground
                        hover:bg-primary/10
                        hover:text-primary
                        transition-colors
                      "
                    >
                      <Eye className="size-4" />
                    </Button>
                  )}

                </div>
              </div>

            </div>
          ))}
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
              Resumes with quantifiable metrics (e.g., "Increased sales by 20%")
              are 40% more likely to pass ATS scans. Update your Master Profile
              to include measurable achievements.
            </p>
          </div>
        </div>
      </Card>

    </div>
  );
}
