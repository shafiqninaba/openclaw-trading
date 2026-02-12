"use client";

import { useState } from "react";
import { useFetch } from "@/hooks/use-fetch";
import { formatDateSGT } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface LessonItem {
  id: string;
  title: string;
  description: string;
  category: string;
  taughtAt: string;
  tradeReasoning: { symbol: string; side: string } | null;
}

export default function LessonsPage() {
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data, loading } = useFetch<LessonItem[]>("/api/lessons");

  const categories = data ? [...new Set(data.map((l) => l.category))] : [];
  const filtered = categoryFilter
    ? data?.filter((l) => l.category === categoryFilter)
    : data;

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!data?.length) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        No lessons yet
      </p>
    );
  }

  return (
    <div className="space-y-3">
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

      {filtered?.map((lesson) => {
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
                  <Badge
                    variant="secondary"
                    className="shrink-0 text-[10px]"
                  >
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
