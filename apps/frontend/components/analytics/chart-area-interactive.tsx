"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

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
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  dashboardAnalyticsApi,
  type ChartInputOutputRow,
} from "@/lib/api/dashboard-analytics"
import type { ApiError } from "@/types/auth"

export const description = "An interactive area chart"

type TimeRange = "90d" | "30d" | "7d"

type ChartPoint = {
  date: string
  inputTokens: number
  outputTokens: number
}

const chartConfig = {
  inputTokens: {
    label: "Input tokens",
    color: "var(--chart-1)",
  },
  outputTokens: {
    label: "Output tokens",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

function parseChartDate(value: string) {
  const match = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(value)
  if (match) {
    const [, year, month, day] = match
    return new Date(Number(year), Number(month) - 1, Number(day))
  }

  return new Date(value)
}

function getTimeRangeLabel(timeRange: TimeRange) {
  if (timeRange === "7d") return "last 7 days"
  if (timeRange === "30d") return "last 30 days"
  return "last 3 months"
}

function getDaysToSubtract(timeRange: TimeRange) {
  if (timeRange === "7d") return 7
  if (timeRange === "30d") return 30
  return 90
}

export function ChartAreaInteractive() {
  const [timeRange, setTimeRange] = React.useState<TimeRange>("90d")
  const [rows, setRows] = React.useState<ChartInputOutputRow[] | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let isMounted = true

    const loadChart = async () => {
      try {
        const response = await dashboardAnalyticsApi.chart()
        if (!isMounted) return
        setRows(response.items ?? [])
        setError(null)
      } catch (err) {
        if (!isMounted) return
        const message =
          (err as ApiError)?.message || "Failed to load analytics chart."
        setError(message)
        setRows([])
      }
    }

    loadChart()

    return () => {
      isMounted = false
    }
  }, [])

  const chartData = React.useMemo<ChartPoint[]>(() => {
    if (!rows?.length) return []

    return rows
      .filter((row) => typeof row.date === "string")
      .map((row) => ({
        date: row.date,
        inputTokens: row.inputTokens,
        outputTokens: row.outputTokens,
      }))
      .sort((a, b) => parseChartDate(a.date).getTime() - parseChartDate(b.date).getTime())
  }, [rows])

  const filteredData = React.useMemo(() => {
    if (!chartData.length) return []

    const referenceDate = parseChartDate(chartData[chartData.length - 1].date)
    const daysToSubtract = getDaysToSubtract(timeRange)

    const startDate = new Date(referenceDate)
    // Include the reference day in the range (e.g. "7d" => last 7 days, inclusive).
    startDate.setDate(startDate.getDate() - (daysToSubtract - 1))

    return chartData.filter((item) => parseChartDate(item.date) >= startDate)
  }, [chartData, timeRange])

  const rangeLabel = getTimeRangeLabel(timeRange)
  const isLoading = rows === null && error === null

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Input vs Output Tokens</CardTitle>
          <CardDescription>
            {isLoading ? "Loading token usage..." : `Showing token usage for the ${rangeLabel}`}
          </CardDescription>
        </div>
        <Select
          value={timeRange}
          onValueChange={(value) => {
            if (value === "90d" || value === "30d" || value === "7d") {
              setTimeRange(value)
            }
          }}
        >
          <SelectTrigger
            className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">
              Last 3 months
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Last 30 days
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Last 7 days
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillInputTokens" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-inputTokens)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-inputTokens)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillOutputTokens" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-outputTokens)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-outputTokens)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = parseChartDate(String(value))
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    const date = parseChartDate(String(value))
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="inputTokens"
              type="natural"
              fill="url(#fillInputTokens)"
              stroke="var(--color-inputTokens)"
            />
            <Area
              dataKey="outputTokens"
              type="natural"
              fill="url(#fillOutputTokens)"
              stroke="var(--color-outputTokens)"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>

        {error && <p className="mt-3 text-xs text-destructive">{error}</p>}
      </CardContent>
    </Card>
  )
}
