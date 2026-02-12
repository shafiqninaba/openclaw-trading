"use client";

import { useState } from "react";
import { useFetch } from "@/hooks/use-fetch";
import { formatCurrency, formatDateSGT } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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

interface LessonItem {
  id: string;
  title: string;
  description: string;
  category: string;
  taughtAt: string;
  tradeReasoning: { symbol: string; side: string } | null;
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

function WatchlistSection() {
  const { data, loading } = useFetch<WatchlistItem[]>("/api/watchlist");

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!data?.length) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Watchlist is empty 🐢
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

function LessonsSection() {
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const url = categoryFilter
    ? `/api/lessons?category=${encodeURIComponent(categoryFilter)}`
    : "/api/lessons";
  const { data, loading } = useFetch<LessonItem[]>(url);

  // Gather unique categories
  const categories = data
    ? [...new Set(data.map((l) => l.category))]
    : [];

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!data?.length) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No lessons yet 🐢
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {/* Category filter chips */}
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setCategoryFilter(null)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              !categoryFilter
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                categoryFilter === cat
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {data.map((lesson) => {
        const isExpanded = expandedId === lesson.id;
        return (
          <Card
            key={lesson.id}
            className="cursor-pointer transition-colors hover:bg-card/80"
            onClick={() => setExpandedId(isExpanded ? null : lesson.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{lesson.title}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">
                      {lesson.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDateSGT(lesson.taughtAt)}
                    </span>
                  </div>
                </div>
                {lesson.tradeReasoning && (
                  <Badge variant="secondary" className="text-[10px] shrink-0">
                    {lesson.tradeReasoning.symbol}
                  </Badge>
                )}
              </div>
              <p
                className={`mt-2 text-sm leading-relaxed text-muted-foreground ${
                  isExpanded ? "" : "line-clamp-2"
                }`}
              >
                {lesson.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default function MorePage() {
  return (
    <div className="space-y-6">
      {/* Watchlist */}
      <Card>
        <CardHeader>
          <CardTitle>Watchlist</CardTitle>
        </CardHeader>
        <CardContent>
          <WatchlistSection />
        </CardContent>
      </Card>

      {/* Lessons */}
      <Card>
        <CardHeader>
          <CardTitle>Lessons</CardTitle>
        </CardHeader>
        <CardContent>
          <LessonsSection />
        </CardContent>
      </Card>
    </div>
  );
}
