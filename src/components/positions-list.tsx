"use client";

import { formatCurrency, formatPercent, plColor } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import type { AlpacaPosition } from "@/lib/alpaca";

export function PositionsList({
  positions,
  loading,
}: {
  positions: AlpacaPosition[] | null;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!positions?.length) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No open positions — Awkclaw is watching the market 🐢
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {positions.map((pos) => {
        const pl = parseFloat(pos.unrealized_pl);
        const plPct = parseFloat(pos.unrealized_plpc) * 100;

        return (
          <div
            key={pos.asset_id}
            className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2.5"
          >
            <div>
              <p className="font-semibold">{pos.symbol}</p>
              <p className="text-xs text-muted-foreground">
                {pos.qty} shares @ {formatCurrency(parseFloat(pos.avg_entry_price))}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm tabular-nums">
                {formatCurrency(parseFloat(pos.current_price))}
              </p>
              <p className={`text-xs font-medium tabular-nums ${plColor(pl)}`}>
                {pl >= 0 ? "+" : ""}
                {formatCurrency(pl)} ({formatPercent(plPct)})
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
