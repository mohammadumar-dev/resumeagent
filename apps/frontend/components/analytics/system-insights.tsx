import { AlertTriangle, Lightbulb, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const insights = [
  {
    id: 1,
    type: "warning",
    icon: AlertTriangle,
    iconColor: "text-[#fa6238]",
    bgColor: "bg-[#fa6238]/10",
    title: "High Latency Detected",
    description:
      "Resume_Pro_V2 agent is experiencing unusual delays (avg 8s) in the US-East region.",
    time: "2m ago",
    actions: [
      { label: "Investigate", variant: "warning" as const },
      { label: "Dismiss", variant: "ghost" as const },
    ],
  },
  {
    id: 2,
    type: "info",
    icon: Lightbulb,
    iconColor: "text-primary",
    bgColor: "bg-primary/10",
    title: "Cost Optimization Opportunity",
    description:
      "Switching 'Reviewer' tasks to Llama 3 could save estimated $45/mo based on current volume.",
    time: "4h ago",
    actions: [],
  },
  {
    id: 3,
    type: "success",
    icon: CheckCircle2,
    iconColor: "text-[#0bda5e]",
    bgColor: "bg-[#0bda5e]/10",
    title: "System Maintenance Complete",
    description:
      "Scheduled database indexing completed successfully. Query performance improved by 14%.",
    time: "1d ago",
    actions: [],
  },
];

export function SystemInsights() {
  return (
    <Card className="glass-panel rounded-3xl p-6">
      <h3 className="mb-6 text-lg font-semibold text-white">
        System Insights &amp; Alerts
      </h3>
      <div className="flex flex-col gap-4">
        {insights.map((insight) => {
          const Icon = insight.icon;
          return (
            <div
              key={insight.id}
              className="flex items-start gap-4 rounded-xl border border-white/5 bg-white/[0.03] p-4"
            >
              <div
                className={`flex size-10 shrink-0 items-center justify-center rounded-full ${insight.bgColor}`}
              >
                <Icon className={`size-5 ${insight.iconColor}`} />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-white">
                  {insight.title}
                </h4>
                <p className="mt-1 text-xs text-slate-400">
                  {insight.description}
                </p>
                {insight.actions.length > 0 && (
                  <div className="mt-2 flex gap-2">
                    {insight.actions.map((action, index) => {
                      if (action.variant === "warning") {
                        return (
                          <Button
                            key={index}
                            size="sm"
                            className="h-auto bg-[#fa6238]/20 px-2 py-1 text-xs text-[#fa6238] hover:bg-[#fa6238]/30"
                          >
                            {action.label}
                          </Button>
                        );
                      }
                      return (
                        <Button
                          key={index}
                          variant="ghost"
                          size="sm"
                          className="h-auto px-2 py-1 text-xs text-slate-500 hover:text-white"
                        >
                          {action.label}
                        </Button>
                      );
                    })}
                  </div>
                )}
              </div>
              <span className="tabular-nums text-xs text-slate-500">
                {insight.time}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}