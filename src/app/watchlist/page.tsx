"use client";

import { useFetch } from "@/hooks/use-fetch";
import { formatCurrency, formatPercent, plColor, isMarketHours } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface WatchlistItem {
  symbol: string;
  name: string | null;
  exchange: string | null;
  watchlistName: string | null;
  // Live market data
  price: number | null;
  change: number | null;
  changePct: number | null;
  dayOpen: number | null;
  dayHigh: number | null;
  dayLow: number | null;
  volume: number | null;
  vwap: number | null;
  prevClose: number | null;
  bidPrice: number | null;
  askPrice: number | null;
  // Asset properties
  tradable: boolean | null;
  shortable: boolean | null;
  fractionable: boolean | null;
  // DB metadata
  notes: string | null;
  status: string;
  updatedAt: string | null;
}

const statusVariant = (status: string) => {
  switch (status) {
    case "watching":
      return "warning" as const;
    case "ready":
      return "success" as const;
    case "passed":
      return "secondary" as const;
    default:
      return "outline" as const;
  }
};

function formatVolume(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return v.toLocaleString();
}

export default function WatchlistPage() {
  const { data, loading } = useFetch<WatchlistItem[]>(
    "/api/watchlist",
    isMarketHours() ? 30_000 : undefined
  );

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-36 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!data?.length) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        Watchlist is empty
      </p>
    );
  }

  return (
    <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
      {data.map((item) => {
        return (
          <Card key={item.symbol}>
            <CardContent className="p-4">
              {/* Header: symbol, name, status */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">{item.symbol}</span>
                    {item.exchange && (
                      <span className="text-xs text-muted-foreground">
                        {item.exchange}
                      </span>
                    )}
                    <Badge variant={statusVariant(item.status)}>
                      {item.status}
                    </Badge>
                  </div>
                  {item.name && (
                    <p className="truncate text-sm text-muted-foreground">
                      {item.name}
                    </p>
                  )}
                </div>

                {/* Price + change */}
                {item.price != null && (
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold tabular-nums">
                      {formatCurrency(item.price)}
                    </p>
                    {item.change != null && item.changePct != null && (
                      <p
                        className={`text-sm font-medium tabular-nums ${plColor(item.change)}`}
                      >
                        {item.change >= 0 ? "+" : ""}
                        {item.change.toFixed(2)}{" "}
                        ({formatPercent(item.changePct)})
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Market data row */}
              {item.price != null && (
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  {item.dayOpen != null && (
                    <span>
                      O{" "}
                      <span className="tabular-nums text-foreground">
                        {item.dayOpen.toFixed(2)}
                      </span>
                    </span>
                  )}
                  {item.dayHigh != null && (
                    <span>
                      H{" "}
                      <span className="tabular-nums text-foreground">
                        {item.dayHigh.toFixed(2)}
                      </span>
                    </span>
                  )}
                  {item.dayLow != null && (
                    <span>
                      L{" "}
                      <span className="tabular-nums text-foreground">
                        {item.dayLow.toFixed(2)}
                      </span>
                    </span>
                  )}
                  {item.prevClose != null && (
                    <span>
                      Prev{" "}
                      <span className="tabular-nums text-foreground">
                        {item.prevClose.toFixed(2)}
                      </span>
                    </span>
                  )}
                  {item.volume != null && (
                    <span>
                      Vol{" "}
                      <span className="tabular-nums text-foreground">
                        {formatVolume(item.volume)}
                      </span>
                    </span>
                  )}
                  {item.vwap != null && (
                    <span>
                      VWAP{" "}
                      <span className="tabular-nums text-foreground">
                        {item.vwap.toFixed(2)}
                      </span>
                    </span>
                  )}
                </div>
              )}

              {/* Bid/Ask spread */}
              {item.bidPrice != null && item.askPrice != null && (
                <div className="mt-1 text-xs text-muted-foreground">
                  Bid{" "}
                  <span className="tabular-nums text-foreground">
                    {item.bidPrice.toFixed(2)}
                  </span>
                  {" / "}Ask{" "}
                  <span className="tabular-nums text-foreground">
                    {item.askPrice.toFixed(2)}
                  </span>
                  <span className="ml-2 text-muted-foreground">
                    spread{" "}
                    <span className="tabular-nums text-foreground">
                      {(item.askPrice - item.bidPrice).toFixed(2)}
                    </span>
                  </span>
                </div>
              )}

              {/* Bot notes */}
              {item.notes && (
                <div className="mt-2 rounded-md bg-muted/50 px-3 py-2">
                  <div className="mb-1 flex items-center justify-between">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      Bot Notes
                    </p>
                    {item.updatedAt && (
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(item.updatedAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {item.notes}
                  </p>
                </div>
              )}

              {/* Asset tags */}
              <div className="mt-3 flex flex-wrap gap-1 text-xs">
                {item.shortable && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    shortable
                  </Badge>
                )}
                {item.fractionable && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    fractional
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
