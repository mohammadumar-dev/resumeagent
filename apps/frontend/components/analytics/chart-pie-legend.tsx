"use client"

import * as React from "react"
import { Pie, PieChart } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    type ChartConfig,
} from "@/components/ui/chart"
import {
    dashboardAnalyticsApi,
    type AgentExecutionStatusResponse,
} from "@/lib/api/dashboard-analytics"
import type { ApiError } from "@/types/auth"

export const description = "A pie chart with a legend"

const chartConfig = {
    success: {
        label: "SUCCESS",
        color: "var(--chart-1)",
    },
    partial: {
        label: "PARTIAL",
        color: "var(--chart-3)",
    },
    failure: {
        label: "FAILURE",
        color: "var(--chart-5)",
    },
} satisfies ChartConfig

export function ChartPieLegend() {
    const [statusCounts, setStatusCounts] =
        React.useState<AgentExecutionStatusResponse | null>(null)
    const [error, setError] = React.useState<string | null>(null)

    React.useEffect(() => {
        let isMounted = true

        const loadStatusCounts = async () => {
            try {
                const response = await dashboardAnalyticsApi.agentExecutionStatus()
                if (!isMounted) return
                setStatusCounts(response)
                setError(null)
            } catch (err) {
                if (!isMounted) return
                const message =
                    (err as ApiError)?.message ||
                    "Failed to load AI execution status."
                setError(message)
                setStatusCounts(null)
            }
        }

        loadStatusCounts()

        return () => {
            isMounted = false
        }
    }, [])

    const chartData = React.useMemo(() => {
        if (!statusCounts) return []

        return [
            {
                status: "success",
                value: statusCounts.successCount ?? 0,
                fill: "var(--color-success)",
            },
            {
                status: "partial",
                value: statusCounts.partialCount ?? 0,
                fill: "var(--color-partial)",
            },
            {
                status: "failure",
                value: statusCounts.failureCount ?? 0,
                fill: "var(--color-failure)",
            },
        ]
    }, [statusCounts])

    const totalCount = React.useMemo(() => {
        if (!statusCounts) return null
        return (
            (statusCounts.successCount ?? 0) +
            (statusCounts.partialCount ?? 0) +
            (statusCounts.failureCount ?? 0)
        )
    }, [statusCounts])

    const isLoading = statusCounts === null && error === null

    return (
        <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
                <CardTitle>AI Execution Status</CardTitle>
                <CardDescription>
                    {isLoading
                        ? "Loading..."
                        : totalCount === null
                          ? "All Time"
                          : `${totalCount.toLocaleString()} total (all time)`}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[300px]"
                >
                    <PieChart>
                        <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="status"
                        />
                        <ChartLegend
                            content={<ChartLegendContent nameKey="status" />}
                            className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
                        />
                    </PieChart>
                </ChartContainer>

                {error && (
                    <p className="mt-3 text-xs text-destructive">{error}</p>
                )}
            </CardContent>
        </Card>
    )
}
