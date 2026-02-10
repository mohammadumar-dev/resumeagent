import { FileText, Briefcase, Star, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";

const stats = [
  {
    icon: FileText,
    value: "24",
    label: "Resumes Generated",
    color: "text-primary bg-primary/10",
  },
  {
    icon: Briefcase,
    value: "8",
    label: "Active Applications",
    color: "text-emerald-500 bg-emerald-500/10",
  },
  {
    icon: Star,
    value: "92%",
    label: "Avg. Match Score",
    color: "text-amber-500 bg-amber-500/10",
  },
  {
    icon: Clock,
    value: "15m",
    label: "Time Saved / App",
    color: "text-purple-500 bg-purple-500/10",
  },
];

export function AnalyticsOverview() {
  return (
    <section className="mt-8 border-t pt-8">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Analytics Overview
      </h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="flex items-center gap-4 border p-4">
              <div
                className={`flex size-10 items-center justify-center rounded-full ${stat.color}`}
              >
                <Icon className="size-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}