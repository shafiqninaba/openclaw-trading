const ALPACA_BASE_URL =
  process.env.ALPACA_BASE_URL || "https://paper-api.alpaca.markets";
const ALPACA_DATA_URL = "https://data.alpaca.markets";
const ALPACA_API_KEY = process.env.ALPACA_API_KEY || "";
const ALPACA_SECRET_KEY = process.env.ALPACA_SECRET_KEY || "";

const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 30_000; // 30 seconds

async function alpacaFetch<T>(
  path: string,
  ttl = CACHE_TTL,
  baseUrl = ALPACA_BASE_URL
): Promise<T> {
  const cacheKey = `${baseUrl}${path}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data as T;
  }

  const res = await fetch(`${baseUrl}${path}`, {
    headers: {
      "APCA-API-KEY-ID": ALPACA_API_KEY,
      "APCA-API-SECRET-KEY": ALPACA_SECRET_KEY,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Alpaca API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  cache.set(cacheKey, { data, timestamp: Date.now() });
  return data as T;
}

export interface AlpacaAccount {
  id: string;
  equity: string;
  cash: string;
  buying_power: string;
  portfolio_value: string;
  last_equity: string;
  long_market_value: string;
  short_market_value: string;
  status: string;
}

export interface AlpacaPosition {
  asset_id: string;
  symbol: string;
  qty: string;
  avg_entry_price: string;
  current_price: string;
  market_value: string;
  unrealized_pl: string;
  unrealized_plpc: string;
  side: string;
}

export interface AlpacaOrder {
  id: string;
  symbol: string;
  qty: string;
  filled_qty: string;
  side: string;
  type: string;
  time_in_force: string;
  status: string;
  limit_price: string | null;
  stop_price: string | null;
  filled_avg_price: string;
  filled_at: string;
  submitted_at: string;
  created_at: string;
  order_class: string;
  legs: AlpacaOrder[] | null;
}

export interface AlpacaPortfolioHistory {
  timestamp: number[];
  equity: number[];
  profit_loss: number[];
  profit_loss_pct: number[];
  base_value: number;
  timeframe: string;
}

export async function getAccount(): Promise<AlpacaAccount> {
  return alpacaFetch<AlpacaAccount>("/v2/account");
}

export async function getPositions(): Promise<AlpacaPosition[]> {
  return alpacaFetch<AlpacaPosition[]>("/v2/positions");
}

export async function getOrders(
  limit = 50
): Promise<AlpacaOrder[]> {
  return alpacaFetch<AlpacaOrder[]>(
    `/v2/orders?status=filled&limit=${limit}&direction=desc`
  );
}

export async function getOpenOrders(): Promise<AlpacaOrder[]> {
  return alpacaFetch<AlpacaOrder[]>(
    `/v2/orders?status=open&direction=desc`
  );
}

export async function getPortfolioHistory(
  period = "1M",
  timeframe = "1D"
): Promise<AlpacaPortfolioHistory> {
  return alpacaFetch<AlpacaPortfolioHistory>(
    `/v2/account/portfolio/history?period=${period}&timeframe=${timeframe}`,
    60_000 // 60 second cache for history
  );
}

/* ── Watchlist ─────────────────────────────────────────────── */

export interface AlpacaAsset {
  id: string;
  class: string;
  exchange: string;
  symbol: string;
  name: string;
  status: string;
  tradable: boolean;
  marginable: boolean;
  shortable: boolean;
  easy_to_borrow: boolean;
  fractionable: boolean;
}

export interface AlpacaWatchlist {
  id: string;
  account_id: string;
  name: string;
  created_at: string;
  updated_at: string;
  assets: AlpacaAsset[];
}

export async function getWatchlists(): Promise<AlpacaWatchlist[]> {
  // The list endpoint doesn't populate assets — fetch each individually
  const summaries = await alpacaFetch<AlpacaWatchlist[]>("/v2/watchlists");
  const full = await Promise.all(
    summaries.map((wl) =>
      alpacaFetch<AlpacaWatchlist>(`/v2/watchlists/${wl.id}`)
    )
  );
  return full;
}

export async function getWatchlistByName(
  name: string
): Promise<AlpacaWatchlist> {
  return alpacaFetch<AlpacaWatchlist>(
    `/v2/watchlists:by_name?name=${encodeURIComponent(name)}`
  );
}

/* ── Market Data Snapshots ─────────────────────────────────── */

export interface SnapshotBar {
  t: string;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
  n: number;
  vw: number;
}

export interface SnapshotTrade {
  t: string;
  x: string;
  p: number;
  s: number;
  c: string[];
  i: number;
  z: string;
}

export interface SnapshotQuote {
  t: string;
  ax: string;
  ap: number;
  as: number;
  bx: string;
  bp: number;
  bs: number;
  c: string[];
  z: string;
}

export interface StockSnapshot {
  latestTrade: SnapshotTrade;
  latestQuote: SnapshotQuote;
  minuteBar: SnapshotBar;
  dailyBar: SnapshotBar;
  prevDailyBar: SnapshotBar;
}

export async function getSnapshots(
  symbols: string[]
): Promise<Record<string, StockSnapshot>> {
  if (symbols.length === 0) return {};
  return alpacaFetch<Record<string, StockSnapshot>>(
    `/v2/stocks/snapshots?symbols=${symbols.join(",")}`,
    CACHE_TTL,
    ALPACA_DATA_URL
  );
}
