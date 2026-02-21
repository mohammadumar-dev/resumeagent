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
      <h3 className="absolute left-6 top-6 text-lg font-semibold text-white">
        Agent Capability Health
      </h3>
      <div className="absolute right-6 top-6 flex items-center gap-2">
        <span className="size-2 rounded-full bg-primary" />
        <span className="text-xs text-slate-400">GPT-4</span>
        <span className="ml-2 size-2 rounded-full bg-purple-500" />
        <span className="text-xs text-slate-400">Claude</span>
      </div>

      <div className="mt-8 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#282e39" />
            <PolarAngleAxis
              dataKey="metric"
              tick={{ fill: "#94a3b8", fontSize: 11 }}
            />
            <Radar
              name="GPT-4"
              dataKey="gpt4"
              stroke="#135bec"
              fill="#135bec"
              fillOpacity={0.2}
              strokeWidth={2}
            />
            <Radar
              name="Claude"
              dataKey="claude"
              stroke="#a855f7"
              fill="#a855f7"
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}