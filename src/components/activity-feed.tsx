"use client";

import Link from "next/link";
import { useFetch } from "@/hooks/use-fetch";
import { formatCurrency, formatDateTimeSGT } from "@/lib/utils";
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
}

export function ActivityFeed() {
  const { data: orders, loading: ordersLoading } = useFetch<AlpacaOrder[]>(
    "/api/orders?limit=5"
  );
  const { data: reasonings, loading: reasoningsLoading } = useFetch<
    TradeReasoningEntry[]
  >("/api/reasoning?limit=10");

  const loading = ordersLoading || reasoningsLoading;

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!orders?.length) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No trades yet — Awkclaw is watching the market 🐢
      </p>
    );
  }

  const reasoningMap = new Map(
    reasonings?.map((r) => [r.alpacaOrderId, r]) ?? []
  );

  return (
    <div className="space-y-3">
      {orders.slice(0, 5).map((order) => {
        const reasoning = reasoningMap.get(order.id);
        const isBuy = order.side === "buy";
        const price = parseFloat(order.filled_avg_price);

        return (
          <div
            key={order.id}
            className="rounded-lg border border-border bg-card p-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant={isBuy ? "success" : "destructive"}>
                  {order.side.toUpperCase()}
                </Badge>
                <span className="font-semibold">{order.symbol}</span>
              </div>
              <div className="text-right">
                <p className="text-sm tabular-nums">{formatCurrency(price)}</p>
                <p className="text-xs text-muted-foreground">
                  {order.filled_at
                    ? formatDateTimeSGT(order.filled_at)
                    : "Pending"}
                </p>
              </div>
            </div>
            {reasoning && (
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                {reasoning.reasoning}
              </p>
            )}
          </div>
        );
      })}

      <Link
        href="/trades"
        className="block text-center text-sm text-muted-foreground hover:text-foreground"
      >
        View all trades →
      </Link>
    </div>
  );
}
