import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Seed initial NVDA trade reasoning entry
  await prisma.tradeReasoning.upsert({
    where: { alpacaOrderId: "seed-nvda-001" },
    update: {},
    create: {
      alpacaOrderId: "seed-nvda-001",
      symbol: "NVDA",
      side: "buy",
      reasoning:
        "NVDA showing strong momentum after earnings beat. AI/datacenter demand continues to accelerate. RSI pulled back to 55 from overbought levels, providing a reasonable entry point. Position sized at 2% of portfolio.",
      strategy: "momentum",
      stopLoss: 120.0,
      takeProfit: 155.0,
      lesson:
        "When entering momentum trades, wait for a pullback to a reasonable RSI level rather than chasing the initial move. This improves risk/reward ratio.",
    },
  });

  // Seed a journal entry
  await prisma.journalEntry.upsert({
    where: { date: new Date("2025-01-15") },
    update: {},
    create: {
      date: new Date("2025-01-15"),
      content: `# Market Open - January 15, 2025

## Market Conditions
- S&P 500 futures up 0.3% pre-market
- 10Y yield steady at 4.65%
- VIX at 16.2 — low volatility environment

## Today's Plan
1. **NVDA** — Watching for a pullback entry around $135. Strong AI demand narrative intact.
2. **AAPL** — Monitoring support at $182. Could be a swing trade setup.

## Trades Executed
- **BUY NVDA** @ $134.50 — Momentum entry on pullback to 20-day MA. Stop at $120, target $155.

## Lessons
- Patience paid off today. Waited for the pullback instead of chasing the morning gap up.
- Always check the options flow before entering. Large call volume confirmed bullish sentiment.
`,
      summary:
        "Entered NVDA on pullback. Market conditions favorable with low VIX.",
    },
  });

  // Seed a watchlist item
  await prisma.watchlist.upsert({
    where: { symbol: "AAPL" },
    update: {},
    create: {
      symbol: "AAPL",
      notes:
        "Watching for a bounce off $182 support. Services revenue growing steadily. iPhone 16 cycle expectations building.",
      targetEntry: 182.0,
      targetExit: 195.0,
      stopLoss: 175.0,
      status: "watching",
    },
  });

  // Seed a lesson
  await prisma.lesson.create({
    data: {
      title: "Position Sizing: The 2% Rule",
      description:
        "Never risk more than 2% of your portfolio on a single trade. This means if your stop loss is 10% below your entry, your position size should be 20% of your portfolio at most. This protects against catastrophic losses and ensures you can survive a string of losing trades.",
      category: "risk management",
      taughtAt: new Date("2025-01-15"),
    },
  });

  console.log("Seed data created successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
