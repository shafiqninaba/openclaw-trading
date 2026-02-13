"use client";

import Link from "next/link";
import { useFetch } from "@/hooks/use-fetch";
import { isMarketHours, formatCurrency, formatPL, formatPercent, plColor } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { EquityChart } from "@/components/equity-chart";
import { PositionsList } from "@/components/positions-list";
import { ActivityFeed } from "@/components/activity-feed";
import type { AlpacaAccount, AlpacaPosition, AlpacaOrder } from "@/lib/alpaca";

interface JournalSummary {
  id: string;
  date: string;
  summary: string | null;
}

interface TradeReasoningEntry {
  id: string;
  alpacaOrderId: string;
  symbol: string;
  side: string;
  reasoning: string;
  strategy: string | null;
}

export default function HomePage() {
  const pollInterval = isMarketHours() ? 60_000 : undefined;

  const { data: account, loading: accountLoading } =
    useFetch<AlpacaAccount>("/api/account", pollInterval);
  const { data: positions, loading: positionsLoading } =
    useFetch<AlpacaPosition[]>("/api/positions", pollInterval);
  const { data: orders, loading: ordersLoading } =
    useFetch<AlpacaOrder[]>("/api/orders?limit=50");
  const { data: reasonings } =
    useFetch<TradeReasoningEntry[]>("/api/reasoning?limit=50");
  const { data: journalEntries, loading: journalLoading } =
    useFetch<JournalSummary[]>("/api/journal");

  const equity = account ? parseFloat(account.equity) : 0;
  const cash = account ? parseFloat(account.cash) : 0;
  const lastEquity = account ? parseFloat(account.last_equity) : 0;
  const todayPL = equity - lastEquity;
  const todayPLPct = lastEquity > 0 ? (todayPL / lastEquity) * 100 : 0;

  const latestJournal = journalEntries?.[0] ?? null;

  const reasoningMap = new Map(
    reasonings?.map((r) => [r.alpacaOrderId, r]) ?? []
  );
  const closedTrades =
    orders?.filter((o) => o.side === "sell" && o.status === "filled") ?? [];

  return (
    <div className="space-y-6">
      {/* Hero — Equity + Cash */}
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
            <p className="text-sm text-muted-foreground tabular-nums">
              Cash {formatCurrency(cash)}
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

      {/* Open Positions + Closed Trades side by side on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Open Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <PositionsList positions={positions} loading={positionsLoading} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Closed Trades</CardTitle>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-lg" />
                ))}
              </div>
            ) : !closedTrades.length ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No closed trades yet
              </p>
            ) : (
              <div className="space-y-2">
                {closedTrades.slice(0, 5).map((order) => {
                  const reasoning = reasoningMap.get(order.id);
                  return (
                    <div
                      key={order.id}
                      className="rounded-lg border border-border bg-card p-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive">SELL</Badge>
                          <span className="font-semibold">{order.symbol}</span>
                        </div>
                        <p className="text-sm tabular-nums">
                          {formatCurrency(parseFloat(order.filled_avg_price))} ×{" "}
                          {order.filled_qty}
                        </p>
                      </div>
                      {reasoning && (
                        <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                          {reasoning.reasoning}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity + Latest Journal side by side on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityFeed />
          </CardContent>
        </Card>

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
    </div>
  );
}
