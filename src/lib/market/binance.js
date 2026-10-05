import "server-only";
import { SYMBOLS, TIMEFRAMES } from "./types";
import { analyzeTimeframe } from "./engine";

const API = "https://fapi.binance.com";
const TIMEOUT_MS = 8_000;

async function getJson(path) {
  const response = await fetch(`${API}${path}`, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!response.ok)
    throw new Error(`Market provider returned ${response.status}`);
  return response.json();
}

function numberAt(row, index) {
  return Number(row[index] ?? 0);
}

function normalizeCandle(row) {
  return {
    openTime: numberAt(row, 0),
    open: numberAt(row, 1),
    high: numberAt(row, 2),
    low: numberAt(row, 3),
    close: numberAt(row, 4),
    volume: numberAt(row, 5),
    closeTime: numberAt(row, 6),
    closed: numberAt(row, 6) < Date.now(),
  };
}

export async function getMarketSnapshot(symbol) {
  try {
    const [tickerRaw, fundingRaw, oiRaw, dailyRaw, ...klinesRaw] =
      await Promise.all([
        getJson(`/fapi/v1/ticker/24hr?symbol=${symbol}`),
        getJson(`/fapi/v1/premiumIndex?symbol=${symbol}`),
        getJson(`/fapi/v1/openInterest?symbol=${symbol}`),
        getJson(`/fapi/v1/klines?symbol=${symbol}&interval=1d&limit=3`),
        ...TIMEFRAMES.map((tf) =>
          getJson(`/fapi/v1/klines?symbol=${symbol}&interval=${tf}&limit=240`),
        ),
      ]);
    const watchlistRaw = await getJson(`/fapi/v1/ticker/24hr`);
    const ticker = tickerRaw;
    const funding = fundingRaw;
    const oi = oiRaw;
    const daily = dailyRaw.map(normalizeCandle);
    const previous = daily.at(-2) ?? daily.at(-1);
    if (!previous) throw new Error("Previous-day data is unavailable");

    const analyses = Object.fromEntries(
      TIMEFRAMES.map((timeframe, index) => [
        timeframe,
        analyzeTimeframe({
          symbol,
          timeframe,
          candles: klinesRaw[index].map(normalizeCandle),
          previousDayHigh: previous.high,
          previousDayLow: previous.low,
        }),
      ]),
    );

    const watchlist = SYMBOLS.map((item) => {
      const match = watchlistRaw.find((t) => t.symbol === item);
      return {
        symbol: item,
        price: Number(match?.lastPrice ?? 0),
        change24h: Number(match?.priceChangePercent ?? 0),
      };
    });

    return {
      symbol,
      price: Number(ticker.lastPrice ?? 0),
      change24h: Number(ticker.priceChangePercent ?? 0),
      fundingRate: Number(funding.lastFundingRate ?? 0) * 100,
      openInterest:
        Number(oi.openInterest ?? 0) * Number(ticker.lastPrice ?? 0),
      previousDayHigh: previous.high,
      previousDayLow: previous.low,
      updatedAt: Date.now(),
      status: "connected",
      analyses,
      watchlist,
      error: null,
    };
  } catch (error) {
    console.error("Binance market snapshot failed", error);
    throw new Error("Live market data is temporarily unavailable.");
  }
}
