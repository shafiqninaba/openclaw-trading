"use client";

import Link from "next/link";
import { useFetch } from "@/hooks/use-fetch";
import { isMarketHours, formatCurrency, formatPL, formatPercent, plColor } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EquityChart } from "@/components/equity-chart";
import { PositionsList } from "@/components/positions-list";
import { ActivityFeed } from "@/components/activity-feed";
import type { AlpacaAccount } from "@/lib/alpaca";
import type { AlpacaPosition } from "@/lib/alpaca";

interface JournalSummary {
  id: string;
  date: string;
  summary: string | null;
}

export default function HomePage() {
  const pollInterval = isMarketHours() ? 60_000 : undefined;

  const { data: account, loading: accountLoading } =
    useFetch<AlpacaAccount>("/api/account", pollInterval);
  const { data: positions, loading: positionsLoading } =
    useFetch<AlpacaPosition[]>("/api/positions", pollInterval);
  const { data: journalEntries, loading: journalLoading } =
    useFetch<JournalSummary[]>("/api/journal");

  const equity = account ? parseFloat(account.equity) : 0;
  const lastEquity = account ? parseFloat(account.last_equity) : 0;
  const todayPL = equity - lastEquity;
  const todayPLPct = lastEquity > 0 ? (todayPL / lastEquity) * 100 : 0;

  const latestJournal = journalEntries?.[0] ?? null;

  return (
    <div className="space-y-6">
      {/* Hero — Equity */}
      <div className="space-y-1">
        {accountLoading ? (
          <>
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-6 w-32" />
          </>
        ) : (
          <>
            <p className="text-4xl font-bold tabular-nums">
              {formatCurrency(equity)}
            </p>
            <p className={`text-lg font-medium tabular-nums ${plColor(todayPL)}`}>
              {formatPL(todayPL)} ({formatPercent(todayPLPct)}) today
            </p>
          </>
        )}
      </div>

      {/* Equity Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Equity</CardTitle>
        </CardHeader>
        <CardContent>
          <EquityChart />
        </CardContent>
      </Card>

      {/* Open Positions */}
      <Card>
        <CardHeader>
          <CardTitle>Open Positions</CardTitle>
        </CardHeader>
        <CardContent>
          <PositionsList positions={positions} loading={positionsLoading} />
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityFeed />
        </CardContent>
      </Card>

      {/* Latest Journal */}
      <Card>
        <CardHeader>
          <CardTitle>Latest Journal</CardTitle>
        </CardHeader>
        <CardContent>
          {journalLoading ? (
            <Skeleton className="h-16 w-full" />
          ) : latestJournal ? (
            <Link
              href={`/journal?date=${latestJournal.date}`}
              className="block"
            >
              <p className="text-sm text-muted-foreground">
                {new Date(latestJournal.date).toLocaleDateString("en-SG", {
                  timeZone: "Asia/Singapore",
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p className="mt-1 text-sm leading-relaxed">
                {latestJournal.summary || "View entry →"}
              </p>
            </Link>
          ) : (
            <p className="text-sm text-muted-foreground">
              No journal entries yet 🐢
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
