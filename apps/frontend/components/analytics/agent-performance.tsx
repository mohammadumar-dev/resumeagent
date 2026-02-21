"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Timer } from "lucide-react";
import {
  dashboardAnalyticsApi,
  type AgentExecutionTimeResponse,
} from "@/lib/api/dashboard-analytics";
import type { ApiError } from "@/types/auth";

type AgentField = keyof AgentExecutionTimeResponse;

const agentConfig: Array<{
  name: string;
  field: AgentField;
  color: string;
}> = [
    { name: "Resume Parser", field: "resumeParser", color: "bg-primary" },
    {
      name: "Job Description Analyzer",
      field: "jobDescriptionAnalyzer",
      color: "bg-purple-500",
    },
    { name: "Matching", field: "matching", color: "bg-cyan-500" },
    { name: "Resume Rewriter", field: "resumeRewriter", color: "bg-blue-400" },
    { name: "ATS Optimizer", field: "atsOptimizer", color: "bg-green-400" },
  ];

function formatSeconds(ms: number | null) {
  if (ms === null) return "--";
  return `${(ms / 1000).toFixed(1)}s`;
}

export function AgentPerformance() {
  const [executionTimes, setExecutionTimes] = useState<AgentExecutionTimeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadExecutionTimes = async () => {
      try {
        const response = await dashboardAnalyticsApi.agentExecutionTime();
        if (!isMounted) return;
        setExecutionTimes(response);
        setError(null);
      } catch (err) {
        if (!isMounted) return;
        const message =
          (err as ApiError)?.message || "Failed to load agent execution time.";
        setError(message);
      }
    };

    loadExecutionTimes();

    return () => {
      isMounted = false;
    };
  }, []);

  const agents = useMemo(() => {
    const values = agentConfig.map((agent) => {
      const valueMs = executionTimes?.[agent.field] ?? null;
      return {
        ...agent,
        valueMs,
      };
    });

    const maxMs = values.reduce((max, agent) => {
      if (agent.valueMs === null) return max;
      return Math.max(max, agent.valueMs);
    }, 0);

    return values.map((agent) => ({
      ...agent,
      percentage:
        agent.valueMs === null || maxMs === 0
          ? 0
          : Math.round((agent.valueMs / maxMs) * 100),
      valueLabel: formatSeconds(agent.valueMs),
    }));
  }, [executionTimes]);

  return (
    <Card className="glass-panel rounded-3xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">
            Average Agent Execution Time
          </h3>
          <p className="text-sm text-muted-foreground">
            Mean processing duration per AI operation
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-md bg-muted/40 px-3 py-1 text-sm text-muted-foreground">
          <Timer className="h-4 w-4" />
          <span>All Time</span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {agents.map((agent, index) => (
          <div key={index} className="group">
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-slate-300 transition group-hover:text-white">
                {agent.name}
              </span>
              <span className="font-mono text-white">{agent.valueLabel}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className={`h-2 rounded-full ${agent.color} transition-all`}
                style={{ width: `${agent.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      {error && <p className="mt-3 text-xs text-destructive">{error}</p>}
    </Card>
  );
}
