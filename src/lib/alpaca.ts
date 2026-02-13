const ALPACA_BASE_URL =
  process.env.ALPACA_BASE_URL || "https://paper-api.alpaca.markets";
const ALPACA_API_KEY = process.env.ALPACA_API_KEY || "";
const ALPACA_SECRET_KEY = process.env.ALPACA_SECRET_KEY || "";

const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 30_000; // 30 seconds

async function alpacaFetch<T>(path: string, ttl = CACHE_TTL): Promise<T> {
  const cacheKey = path;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data as T;
  }

  const res = await fetch(`${ALPACA_BASE_URL}${path}`, {
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
