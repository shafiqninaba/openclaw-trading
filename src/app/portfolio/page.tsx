"use client";

import { useFetch } from "@/hooks/use-fetch";
import { isMarketHours, formatCurrency, formatPL, formatPercent, plColor } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EquityChart } from "@/components/equity-chart";
import { Badge } from "@/components/ui/badge";
import type { AlpacaAccount, AlpacaPosition, AlpacaOrder } from "@/lib/alpaca";

interface TradeReasoningEntry {
  id: string;
  alpacaOrderId: string;
  symbol: string;
  side: string;
  reasoning: string;
  strategy: string | null;
}

export default function PortfolioPage() {
  const pollInterval = isMarketHours() ? 60_000 : undefined;

  const { data: account, loading: accountLoading } =
    useFetch<AlpacaAccount>("/api/account", pollInterval);
  const { data: positions, loading: positionsLoading } =
    useFetch<AlpacaPosition[]>("/api/positions", pollInterval);
  const { data: orders, loading: ordersLoading } =
    useFetch<AlpacaOrder[]>("/api/orders?limit=50");
  const { data: reasonings } =
    useFetch<TradeReasoningEntry[]>("/api/reasoning?limit=50");

  const equity = account ? parseFloat(account.equity) : 0;
  const cash = account ? parseFloat(account.cash) : 0;

  const reasoningMap = new Map(
    reasonings?.map((r) => [r.alpacaOrderId, r]) ?? []
  );

  // Filter sell orders as "closed trades"
  const closedTrades =
    orders?.filter((o) => o.side === "sell" && o.status === "filled") ?? [];

  return (
    <div className="space-y-6">
      {/* Account Summary */}
      <div className="grid grid-cols-2 gap-3">
        {accountLoading ? (
          [1, 2].map((i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))
        ) : (
          <>
            <Card>
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground">Equity</p>
                <p className="text-sm font-semibold tabular-nums">
                  {formatCurrency(equity)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground">Cash</p>
                <p className="text-sm font-semibold tabular-nums">
                  {formatCurrency(cash)}
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Equity Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Equity Curve</CardTitle>
        </CardHeader>
        <CardContent>
          <EquityChart />
        </CardContent>
      </Card>

      {/* Position Cards */}
      <div>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">
          Open Positions
        </h2>
        {positionsLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))}
          </div>
        ) : !positions?.length ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No open positions 🐢
          </p>
        ) : (
          <div className="space-y-3">
            {positions.map((pos) => {
              const pl = parseFloat(pos.unrealized_pl);
              const plPct = parseFloat(pos.unrealized_plpc) * 100;
              const marketValue = parseFloat(pos.market_value);

              return (
                <Card key={pos.asset_id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-lg font-bold">{pos.symbol}</p>
                        <p className="text-xs text-muted-foreground">
                          {pos.qty} shares
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium tabular-nums">
                          {formatCurrency(marketValue)}
                        </p>
                        <p
                          className={`text-sm font-semibold tabular-nums ${plColor(pl)}`}
                        >
                          {formatPL(pl)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <p className="text-muted-foreground">Entry</p>
                        <p className="tabular-nums">
                          {formatCurrency(parseFloat(pos.avg_entry_price))}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Current</p>
                        <p className="tabular-nums">
                          {formatCurrency(parseFloat(pos.current_price))}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">P/L %</p>
                        <p className={`tabular-nums ${plColor(plPct)}`}>
                          {formatPercent(plPct)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Closed Trades */}
      <div>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">
          Closed Trades
        </h2>
        {ordersLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : !closedTrades.length ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No closed trades yet
          </p>
        ) : (
          <div className="space-y-2">
            {closedTrades.map((order) => {
              const reasoning = reasoningMap.get(order.id);
              return (
                <Card key={order.id}>
                  <CardContent className="p-3">
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
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
