"use client";

import { Card } from "@/components/ui/card";
import { Label, Pie, PieChart, Cell, ResponsiveContainer } from "recharts";

const data = [
  { name: "SUCCESS", value: 40, color: "#135bec" },
  { name: "FAILURE", value: 10, color: "#fa6238" },
];

export function StatusDistribution() {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const totalCount = 1200;

  return (
    <Card className="glass-panel flex flex-col rounded-3xl p-6">
      <h3 className="mb-6 text-lg font-semibold text-white">
        AI Execution Status
      </h3>

      <div className="relative flex flex-1 flex-col items-center justify-center">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-white text-2xl font-bold tabular-nums"
                        >
                          {(totalCount / 1000).toFixed(1)}k
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 20}
                          className="fill-slate-400 text-[10px] uppercase"
                        >
                          Total
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-6 flex justify-between px-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="size-2.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-slate-300">{item.name}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}