import type { CoinSearchResult, PricePoint } from "@/lib/types";

const COINGECKO_API_BASE = "https://api.coingecko.com/api/v3";

type CoinGeckoSearchResponse = {
  coins?: Array<{
    id: string;
    name: string;
    symbol: string;
    market_cap_rank?: number;
    thumb?: string;
  }>;
};

type CoinGeckoMarketChartResponse = {
  prices?: Array<[number, number]>;
};

export async function searchCoins(query: string): Promise<CoinSearchResult[]> {
  const trimmedQuery = query.trim();

  if (trimmedQuery.length < 2) {
    return defaultCoins;
  }

  const data = await requestCoinGecko<CoinGeckoSearchResponse>(
    `/search?query=${encodeURIComponent(trimmedQuery)}`
  );

  return (data.coins ?? [])
    .sort((a, b) => (a.market_cap_rank ?? 999_999) - (b.market_cap_rank ?? 999_999))
    .slice(0, 12)
    .map((coin) => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol.toUpperCase(),
      thumb: coin.thumb
    }));
}

export async function fetchMarketHistory({
  coinId,
  currency,
  from,
  to
}: {
  coinId: string;
  currency: string;
  from: number;
  to: number;
}): Promise<PricePoint[]> {
  const params = new URLSearchParams({
    vs_currency: currency,
    from: String(from),
    to: String(to)
  });

  const data = await requestCoinGecko<CoinGeckoMarketChartResponse>(
    `/coins/${encodeURIComponent(coinId)}/market_chart/range?${params.toString()}`
  );

  return (data.prices ?? []).map(([timestamp, price]) => ({ timestamp, price }));
}

async function requestCoinGecko<T>(path: string): Promise<T> {
  const headers: HeadersInit = {
    accept: "application/json"
  };

  if (process.env.COINGECKO_DEMO_API_KEY) {
    headers["x-cg-demo-api-key"] = process.env.COINGECKO_DEMO_API_KEY;
  }

  const response = await fetch(`${COINGECKO_API_BASE}${path}`, {
    headers,
    next: { revalidate: 15 * 60 }
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as
      | {
          error?: {
            status?: {
              error_message?: string;
            };
          };
          status?: {
            error_message?: string;
          };
        }
      | null;

    const apiMessage =
      data?.error?.status?.error_message ?? data?.status?.error_message ?? null;

    if (response.status === 429) {
      throw new Error(
        apiMessage ?? "Limite CoinGecko atteinte. Réessayez dans quelques instants."
      );
    }

    throw new Error(apiMessage ?? `Erreur CoinGecko (${response.status}).`);
  }

  return response.json() as Promise<T>;
}

const defaultCoins: CoinSearchResult[] = [
  {
    id: "bitcoin",
    name: "Bitcoin",
    symbol: "BTC",
    thumb: "https://coin-images.coingecko.com/coins/images/1/thumb/bitcoin.png"
  },
  {
    id: "ethereum",
    name: "Ethereum",
    symbol: "ETH",
    thumb: "https://coin-images.coingecko.com/coins/images/279/thumb/ethereum.png"
  },
  {
    id: "solana",
    name: "Solana",
    symbol: "SOL",
    thumb: "https://coin-images.coingecko.com/coins/images/4128/thumb/solana.png"
  },
  {
    id: "tether",
    name: "Tether",
    symbol: "USDT",
    thumb: "https://coin-images.coingecko.com/coins/images/325/thumb/Tether.png"
  }
];
