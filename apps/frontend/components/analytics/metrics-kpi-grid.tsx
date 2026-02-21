"use client";

import { useEffect, useMemo, useState } from "react";
import { ShieldCheck, Database, Gauge, Cpu } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  dashboardAnalyticsApi,
  type DashboardAnalyticsMetricsResponse,
} from "@/lib/api/dashboard-analytics";
import type { ApiError } from "@/types/auth";

type MetricField = keyof DashboardAnalyticsMetricsResponse;

const kpiConfig: Array<{
  label: string;
  icon: LucideIcon;
  field: MetricField;
}> = [
  {
    label: "AI Success Rate",
    icon: ShieldCheck,
    field: "aiSuccessRate",
  },
  {
    label: "Monthly Resume Limit",
    icon: Gauge,
    field: "monthlyResumeLimit",
  },
  {
    label: "Monthly Tokens Used",
    icon: Cpu,
    field: "monthlyTokensUsed",
  },
  {
    label: "Total Tokens Used",
    icon: Database,
    field: "totalTokensUsed",
  },
];

function formatPercent(value: number | null) {
  if (value === null) return "--";
  return `${value.toFixed(1)}%`;
}

function formatCount(value: number | null) {
  if (value === null) return "--";
  return new Intl.NumberFormat("en-US").format(value);
}

function formatValue(field: MetricField, value: number | null) {
  if (value === null) {
    return "--";
  }

  if (field === "aiSuccessRate") {
    return formatPercent(value);
  }

  if (field === "monthlyResumeLimit") {
    return `${value} / 5`;
  }

  return formatCount(value);
}

export function MetricsKPIGrid() {
  const [metrics, setMetrics] = useState<DashboardAnalyticsMetricsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadMetrics = async () => {
      try {
        const response = await dashboardAnalyticsApi.metrics();
        if (!isMounted) return;
        setMetrics(response);
        setError(null);
      } catch (err) {
        if (!isMounted) return;
        const message =
          (err as ApiError)?.message || "Failed to load analytics metrics.";
        setError(message);
      }
    };

    loadMetrics();

    return () => {
      isMounted = false;
    };
  }, []);

  const values = useMemo(() => {
    return kpiConfig.map((config) => {
      const value =
        metrics === null ? null : metrics[config.field];
      return {
        ...config,
        value: formatValue(config.field, value ?? null),
      };
    });
  }, [metrics]);

  return (
    <section>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {values.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card
              key={index}
              className="glass-panel flex min-h-[140px] flex-col justify-between rounded-3xl p-5 transition-colors hover:bg-white/[0.02]"
            >
              <div className="flex items-start justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  {kpi.label}
                </span>
                <Icon className="size-5 text-slate-600" />
              </div>
              <div>
                <div className="text-3xl font-bold tabular-nums tracking-tight text-white">
                  {kpi.value}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {error && (
        <p className="mt-3 text-xs text-destructive">{error}</p>
      )}
    </section>
  );
}
