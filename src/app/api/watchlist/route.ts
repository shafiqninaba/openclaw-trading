import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateBot } from "@/lib/auth";
import { getWatchlists, getSnapshots } from "@/lib/alpaca";

export async function GET() {
  try {
    // Fetch Alpaca watchlists + DB metadata in parallel
    const [alpacaWatchlists, dbItems] = await Promise.all([
      getWatchlists().catch(() => [] as Awaited<ReturnType<typeof getWatchlists>>),
      prisma.watchlist.findMany({ orderBy: { updatedAt: "desc" } }),
    ]);

    // Collect all symbols from Alpaca watchlists
    const alpacaAssets = alpacaWatchlists.flatMap((wl) =>
      (wl.assets ?? []).map((a) => ({ ...a, watchlistName: wl.name }))
    );
    const symbols = alpacaAssets.map((a) => a.symbol);

    // Fetch market snapshots for all symbols
    const snapshots =
      symbols.length > 0
        ? await getSnapshots(symbols).catch(() => ({}) as Record<string, never>)
        : {};

    // Build a lookup from DB items by symbol
    const dbBySymbol = new Map(dbItems.map((item) => [item.symbol, item]));

    // Merge: Alpaca assets as the source of truth, enriched with snapshots + DB metadata
    const merged = alpacaAssets.map((asset) => {
      const snap = snapshots[asset.symbol];
      const db = dbBySymbol.get(asset.symbol);

      const price = snap?.latestTrade?.p ?? null;
      const prevClose = snap?.prevDailyBar?.c ?? null;
      const change =
        price != null && prevClose != null ? price - prevClose : null;
      const changePct =
        change != null && prevClose ? (change / prevClose) * 100 : null;

      return {
        symbol: asset.symbol,
        name: asset.name,
        exchange: asset.exchange,
        watchlistName: asset.watchlistName,
        // Live market data
        price,
        change,
        changePct,
        dayOpen: snap?.dailyBar?.o ?? null,
        dayHigh: snap?.dailyBar?.h ?? null,
        dayLow: snap?.dailyBar?.l ?? null,
        volume: snap?.dailyBar?.v ?? null,
        vwap: snap?.dailyBar?.vw ?? null,
        prevClose,
        bidPrice: snap?.latestQuote?.bp ?? null,
        askPrice: snap?.latestQuote?.ap ?? null,
        // Asset properties from Alpaca
        tradable: asset.tradable,
        shortable: asset.shortable,
        fractionable: asset.fractionable,
        // DB metadata
        notes: db?.notes ?? null,
        updatedAt: db?.updatedAt?.toISOString() ?? null,
      };
    });

    // Also include DB-only items that aren't in any Alpaca watchlist
    const alpacaSymbols = new Set(symbols);
    const dbOnlyItems = dbItems
      .filter((item) => !alpacaSymbols.has(item.symbol))
      .map((item) => ({
        symbol: item.symbol,
        name: null,
        exchange: null,
        watchlistName: null,
        price: null,
        change: null,
        changePct: null,
        dayOpen: null,
        dayHigh: null,
        dayLow: null,
        volume: null,
        vwap: null,
        prevClose: null,
        bidPrice: null,
        askPrice: null,
        tradable: null,
        shortable: null,
        fractionable: null,
        notes: item.notes,
        updatedAt: item.updatedAt.toISOString(),
      }));

    return NextResponse.json([...merged, ...dbOnlyItems]);
  } catch (error) {
    console.error("Failed to fetch watchlist:", error);
    return NextResponse.json(
      { error: "Failed to fetch watchlist" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const authError = authenticateBot(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const { symbol, notes } = body;

    if (!symbol) {
      return NextResponse.json(
        { error: "symbol is required" },
        { status: 400 }
      );
    }

    const item = await prisma.watchlist.upsert({
      where: { symbol },
      update: {
        notes: notes || null,
        updatedAt: new Date(),
      },
      create: {
        symbol,
        notes: notes || null,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Failed to upsert watchlist item:", error);
    return NextResponse.json(
      { error: "Failed to upsert watchlist item" },
      { status: 500 }
    );
  }
}

