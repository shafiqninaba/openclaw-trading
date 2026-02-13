"use client";

import { useFetch } from "@/hooks/use-fetch";
import {
  formatCurrency,
  formatDateTimeSGT,
} from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { AlpacaOrder } from "@/lib/alpaca";

interface TradeReasoningEntry {
  id: string;
  alpacaOrderId: string;
  symbol: string;
  side: string;
  reasoning: string;
  strategy: string | null;
  stopLoss: string | null;
  takeProfit: string | null;
}

export default function TradesPage() {
  const { data: orders, loading: ordersLoading } =
    useFetch<AlpacaOrder[]>("/api/orders?limit=50");
  const { data: reasonings, loading: reasoningsLoading } =
    useFetch<TradeReasoningEntry[]>("/api/reasoning?limit=50");

  const loading = ordersLoading || reasoningsLoading;

  const reasoningMap = new Map(
    reasonings?.map((r) => [r.alpacaOrderId, r]) ?? []
  );

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Trade History</h1>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : !orders?.length ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No trades yet — Awkclaw is watching the market 🐢
        </p>
      ) : (
        <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
          {orders.map((order) => {
            const reasoning = reasoningMap.get(order.id);
            const isBuy = order.side === "buy";
            const price = parseFloat(order.filled_avg_price);

            return (
              <Card key={order.id}>
                <CardContent className="p-4">
                  {/* Trade header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={isBuy ? "success" : "destructive"}>
                        {order.side.toUpperCase()}
                      </Badge>
                      <span className="text-lg font-bold">{order.symbol}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold tabular-nums">
                        {formatCurrency(price)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        × {order.filled_qty} shares
                      </p>
                    </div>
                  </div>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {order.filled_at
                      ? formatDateTimeSGT(order.filled_at)
                      : "Pending"}
                  </p>

                  {/* Reasoning — the key educational value */}
                  {reasoning && (
                    <div className="mt-3 rounded-lg bg-secondary/50 p-3">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          Reasoning
                        </span>
                        {reasoning.strategy && (
                          <Badge variant="outline" className="text-[10px]">
                            {reasoning.strategy}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm leading-relaxed">
                        {reasoning.reasoning}
                      </p>

                      {(reasoning.stopLoss || reasoning.takeProfit) && (
                        <div className="mt-2 flex gap-4 text-xs">
                          {reasoning.stopLoss && (
                            <span className="text-red-500">
                              SL: {formatCurrency(parseFloat(reasoning.stopLoss))}
                            </span>
                          )}
                          {reasoning.takeProfit && (
                            <span className="text-green-500">
                              TP:{" "}
                              {formatCurrency(parseFloat(reasoning.takeProfit))}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
