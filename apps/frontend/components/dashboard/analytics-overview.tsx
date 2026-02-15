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
    <section className="relative mt-10 border-t pt-10">

      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute left-0 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Analytics Overview
        </h3>
      </div>

      {/* Responsive Grid */}
      <div className="
        grid gap-4
        grid-cols-1
        sm:grid-cols-2
        md:grid-cols-2
        lg:grid-cols-4
      ">
        {stats.map((stat, index) => {
          const Icon = stat.icon;

          return (
            <Card
              key={index}
              className="
                group
                relative
                overflow-hidden
                border
                bg-card/70
                backdrop-blur-xl
                shadow-sm
                transition-all duration-300
                hover:-translate-y-1
                hover:shadow-lg
              "
            >
              {/* subtle hover gradient */}
              <div
                aria-hidden
                className="
                  pointer-events-none
                  absolute inset-0
                  bg-gradient-to-br
                  from-white/5
                  via-transparent
                  to-transparent
                  opacity-0
                  transition-opacity duration-300
                  group-hover:opacity-100
                "
              />

              <div className="relative flex items-center gap-4 p-5">

                {/* Icon capsule */}
                <div
                  className={`
                    flex size-11 shrink-0 items-center justify-center
                    rounded-xl
                    backdrop-blur-sm
                    ${stat.color}
                  `}
                >
                  <Icon className="size-5" />
                </div>

                {/* Content */}
                <div className="flex flex-col">
                  <p className="text-2xl font-bold tracking-tight text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-xs font-medium text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              </div>

            </Card>
          );
        })}
      </div>
    </section>
  );
}
