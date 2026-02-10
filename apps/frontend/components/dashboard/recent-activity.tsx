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
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20",
  amber: "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20",
  red: "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20",
};

export function RecentActivity() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Recent Activity</h3>
        <Link
          href="/dashboard/activity"
          className="text-sm font-medium text-primary hover:text-primary/80"
        >
          View All
        </Link>
      </div>

      <Card className="overflow-hidden border">
        {activities.map((activity, index) => (
          <div
            key={activity.id}
            className={`p-4 transition-colors hover:bg-muted/50 ${
              index !== activities.length - 1 ? "border-b" : ""
            }`}
          >
            <div className="mb-1 flex items-start justify-between gap-3">
              <div>
                <h4 className="line-clamp-1 text-sm font-semibold">
                  {activity.title}
                </h4>
                <p className="text-xs font-medium text-muted-foreground">
                  {activity.company}
                </p>
              </div>
              <Badge
                variant="outline"
                className={`inline-flex items-center rounded-full px-2 py-1 text-[10px] font-medium ring-1 ring-inset ${
                  statusStyles[activity.statusColor as keyof typeof statusStyles]
                }`}
              >
                {activity.status}
              </Badge>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">
                {activity.time}
              </span>
              <div className="flex gap-2">
                {activity.actions.includes("download") && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-primary"
                  >
                    <Download className="size-4" />
                  </Button>
                )}
                {activity.actions.includes("edit") && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-primary"
                  >
                    <Edit className="size-4" />
                  </Button>
                )}
                {activity.actions.includes("view") && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-primary"
                  >
                    <Eye className="size-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </Card>

      {/* Pro Tip Card */}
      <Card className="border-primary/20 bg-primary/5 p-4">
        <div className="flex gap-3">
          <Lightbulb className="mt-0.5 size-5 text-primary" />
          <div>
            <h4 className="mb-1 text-sm font-bold">Pro Tip</h4>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Resumes with quantifiable metrics (e.g., "Increased sales by 20%")
              are 40% more likely to pass ATS scans. Update your Master Profile
              to include more numbers.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}