"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { week: "Week 1", resumes: 3 },
  { week: "Week 2", resumes: 2 },
  { week: "Week 3", resumes: 5 },
  { week: "Week 4", resumes: 1 },
  { week: "Week 5", resumes: 4 },
  { week: "Week 6", resumes: 2 },
  { week: "Week 7", resumes: 3 },
  { week: "Week 8", resumes: 4 },
  { week: "Week 9", resumes: 2 },
  { week: "Week 10", resumes: 5 },
];

export function ResumeTrendChart() {
  return (
    <Card className="glass-panel rounded-3xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">
            Resume Creation Trend
          </h3>
          <p className="text-sm text-slate-400">Volume over the last 30 days</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="bg-primary/10 text-sm font-medium text-primary hover:bg-primary/20 hover:text-white"
        >
          Export CSV
        </Button>
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorResumes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#135bec" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#135bec" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#135bec" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="week"
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              interval={3}
            />
            <YAxis
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              ticks={[0, 5]}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border border-white/10 bg-surface-dark p-2 shadow-xl">
                      <p className="mb-0.5 text-[10px] text-slate-400">
                        {payload[0].payload.week}
                      </p>
                      <p className="text-sm font-bold tabular-nums text-white">
                        {payload[0].value} Resumes
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="resumes"
              stroke="url(#strokeGradient)"
              fill="url(#colorResumes)"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: "#135bec", stroke: "#fff", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex justify-between px-1 text-xs text-slate-500">
        <span>Week 1</span>
        <span>Week 2</span>
        <span>Week 3</span>
        <span>Week 4</span>
      </div>
    </Card>
  );
}