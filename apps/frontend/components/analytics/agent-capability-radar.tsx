"use client";

import { Card } from "@/components/ui/card";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Legend } from "recharts";

const data = [
  { metric: "Success", gpt4: 95, claude: 85 },
  { metric: "Efficiency", gpt4: 90, claude: 80 },
  { metric: "Time", gpt4: 70, claude: 75 },
  { metric: "Cost", gpt4: 60, claude: 70 },
  { metric: "Memory", gpt4: 75, claude: 65 },
];

export function AgentCapabilityRadar() {
  return (
    <Card className="glass-panel relative flex min-h-[300px] flex-col items-center justify-center rounded-3xl p-6">
      <h3 className="absolute left-6 top-6 text-lg font-semibold text-foreground">
        Agent Capability Health
      </h3>
      <div className="absolute right-6 top-6 flex items-center gap-2">
        <span className="size-2 rounded-full bg-primary" />
        <span className="text-xs text-muted-foreground">GPT-4</span>
        <span className="ml-2 size-2 rounded-full bg-[var(--chart-4)]" />
        <span className="text-xs text-muted-foreground">Claude</span>
      </div>

      <div className="mt-8 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="var(--border)" strokeOpacity={0.6} />
            <PolarAngleAxis
              dataKey="metric"
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            />
            <Radar
              name="GPT-4"
              dataKey="gpt4"
              stroke="var(--chart-1)"
              fill="var(--chart-1)"
              fillOpacity={0.2}
              strokeWidth={2}
            />
            <Radar
              name="Claude"
              dataKey="claude"
              stroke="var(--chart-4)"
              fill="var(--chart-4)"
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
