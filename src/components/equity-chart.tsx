"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useFetch } from "@/hooks/use-fetch";
import { formatCurrency, formatDateSGT } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import type { AlpacaPortfolioHistory } from "@/lib/alpaca";

const periods = [
  { label: "1W", value: "1W" },
  { label: "1M", value: "1M" },
  { label: "3M", value: "3M" },
  { label: "All", value: "1A" },
] as const;

interface ChartDataPoint {
  date: string;
  equity: number;
  timestamp: number;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: ChartDataPoint }>;
}) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-md">
      <p className="text-muted-foreground">{data.date}</p>
      <p className="font-semibold tabular-nums">{formatCurrency(data.equity)}</p>
    </div>
  );
}

export function EquityChart() {
  const [period, setPeriod] = useState("1M");
  const { data, loading } = useFetch<AlpacaPortfolioHistory>(
    `/api/history?period=${period}&timeframe=1D`
  );

  if (loading) {
    return <Skeleton className="h-[200px] w-full rounded-xl" />;
  }

  if (!data || !data.equity?.length) {
    return (
      <div className="flex h-[200px] items-center justify-center rounded-xl border border-border text-sm text-muted-foreground">
        No equity history yet
      </div>
    );
  }

  const chartData: ChartDataPoint[] = data.timestamp.map((ts, i) => ({
    date: formatDateSGT(new Date(ts * 1000)),
    equity: data.equity[i],
    timestamp: ts,
  }));

  const firstEquity = chartData[0]?.equity ?? 0;
  const lastEquity = chartData[chartData.length - 1]?.equity ?? 0;
  const isPositive = lastEquity >= firstEquity;
  const lineColor = isPositive ? "#22c55e" : "#ef4444";

  return (
    <div className="space-y-3">
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData}>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "hsl(240, 5%, 64.9%)" }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={["auto", "auto"]}
            tick={{ fontSize: 10, fill: "hsl(240, 5%, 64.9%)" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) =>
              `$${(v / 1000).toFixed(0)}k`
            }
            width={45}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="equity"
            stroke={lineColor}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: lineColor }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="flex items-center justify-center gap-1">
        {periods.map((p) => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              period === p.value
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
