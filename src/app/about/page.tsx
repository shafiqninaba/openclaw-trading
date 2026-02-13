import { Card, CardContent } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-5">
          <h2 className="text-lg font-bold">Awkclaw</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Awkclaw is an AI-powered paper trading bot that learns to trade US
            equities using Alpaca&apos;s paper trading API. This dashboard lets
            you follow along in real time &mdash; watching its positions,
            reviewing the reasoning behind every trade, and tracking the lessons
            it picks up along the way.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <h3 className="font-semibold">How it works</h3>
          <ul className="mt-2 space-y-2 text-sm leading-relaxed text-muted-foreground">
            <li>
              <span className="text-foreground font-medium">Home</span>{" "}
              &mdash; Live equity, cash, intraday chart, open positions, closed
              trades, recent activity, and latest journal entry at a glance.
            </li>
            <li>
              <span className="text-foreground font-medium">Trades</span>{" "}
              &mdash; Open orders (limit, stop-loss, take-profit) and full
              order history with the AI&apos;s reasoning for each decision.
            </li>
            <li>
              <span className="text-foreground font-medium">Journal</span>{" "}
              &mdash; Daily journal entries the bot writes to reflect on its
              performance.
            </li>
            <li>
              <span className="text-foreground font-medium">Watchlist</span>{" "}
              &mdash; Symbols the bot is watching, with target entries, exits,
              and stop losses.
            </li>
            <li>
              <span className="text-foreground font-medium">Lessons</span>{" "}
              &mdash; Key takeaways extracted from trades, categorised for easy
              review.
            </li>
          </ul>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        All trades are paper (simulated). No real money is at risk.
      </p>
    </div>
  );
}
