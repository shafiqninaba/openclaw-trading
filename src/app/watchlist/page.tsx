"use client";

import { useFetch } from "@/hooks/use-fetch";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface WatchlistItem {
  id: string;
  symbol: string;
  notes: string | null;
  targetEntry: string | null;
  targetExit: string | null;
  stopLoss: string | null;
  status: string;
  updatedAt: string;
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

export default function WatchlistPage() {
  const { data, loading } = useFetch<WatchlistItem[]>("/api/watchlist");

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
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
    <div className="space-y-3">
      {data.map((item) => (
        <Card key={item.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">{item.symbol}</span>
                <Badge variant={statusVariant(item.status)}>
                  {item.status}
                </Badge>
              </div>
            </div>

            {item.notes && (
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.notes}
              </p>
            )}

            <div className="mt-3 flex gap-4 text-xs">
              {item.targetEntry && (
                <div>
                  <span className="text-muted-foreground">Entry: </span>
                  <span className="tabular-nums">
                    {formatCurrency(parseFloat(item.targetEntry))}
                  </span>
                </div>
              )}
              {item.targetExit && (
                <div>
                  <span className="text-muted-foreground">Exit: </span>
                  <span className="tabular-nums text-green-500">
                    {formatCurrency(parseFloat(item.targetExit))}
                  </span>
                </div>
              )}
              {item.stopLoss && (
                <div>
                  <span className="text-muted-foreground">SL: </span>
                  <span className="tabular-nums text-red-500">
                    {formatCurrency(parseFloat(item.stopLoss))}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
