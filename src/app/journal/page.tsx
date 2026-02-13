"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useFetch } from "@/hooks/use-fetch";
import { formatDateSGT } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface JournalSummary {
  id: string;
  date: string;
  summary: string | null;
}

interface JournalFull {
  id: string;
  date: string;
  content: string;
  summary: string | null;
}

function JournalDetail({
  date,
  onBack,
}: {
  date: string;
  onBack: () => void;
}) {
  const { data, loading } = useFetch<JournalFull>(
    `/api/journal/${date}`
  );

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to journal
      </button>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : !data ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Entry not found
        </p>
      ) : (
        <div>
          <p className="mb-4 text-sm text-muted-foreground">
            {formatDateSGT(data.date)}
          </p>
          <div className="markdown-body prose prose-invert prose-sm max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 className="mb-3 mt-6 text-xl font-bold text-foreground">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="mb-2 mt-5 text-lg font-semibold text-foreground">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="mb-2 mt-4 text-base font-semibold text-foreground">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="mb-3 leading-relaxed text-foreground/90">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="mb-3 list-disc space-y-1 pl-5 text-foreground/90">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="mb-3 list-decimal space-y-1 pl-5 text-foreground/90">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="text-sm">{children}</li>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-foreground">
                    {children}
                  </strong>
                ),
                code: ({ children, className }) => {
                  const isBlock = className?.includes("language-");
                  if (isBlock) {
                    return (
                      <code className="block overflow-x-auto rounded-lg bg-secondary p-3 text-xs">
                        {children}
                      </code>
                    );
                  }
                  return (
                    <code className="rounded bg-secondary px-1.5 py-0.5 text-xs">
                      {children}
                    </code>
                  );
                },
                table: ({ children }) => (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="border border-border bg-secondary px-3 py-2 text-left text-xs font-medium">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="border border-border px-3 py-2 text-xs">
                    {children}
                  </td>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-muted-foreground pl-4 text-muted-foreground italic">
                    {children}
                  </blockquote>
                ),
                hr: () => <hr className="my-4 border-border" />,
              }}
            >
              {data.content}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}

export default function JournalPage() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const { data: entries, loading } = useFetch<JournalSummary[]>("/api/journal");

  if (selectedDate) {
    return (
      <JournalDetail
        date={selectedDate}
        onBack={() => setSelectedDate(null)}
      />
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Trading Journal</h1>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : !entries?.length ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No journal entries yet 🐢
        </p>
      ) : (
        <div className="space-y-2 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
          {entries.map((entry) => (
            <Card
              key={entry.id}
              className="cursor-pointer transition-colors hover:bg-card/80"
              onClick={() => {
                // Extract date portion from ISO string
                const dateStr =
                  typeof entry.date === "string"
                    ? entry.date.split("T")[0]
                    : new Date(entry.date).toISOString().split("T")[0];
                setSelectedDate(dateStr);
              }}
            >
              <CardContent className="p-3">
                <p className="text-sm font-medium">
                  {formatDateSGT(entry.date)}
                </p>
                {entry.summary && (
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {entry.summary}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
