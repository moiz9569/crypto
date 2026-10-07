export const SYMBOLS = [ "BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "XRPUSDT",
  "DOGEUSDT", "ADAUSDT", "AVAXUSDT", "LINKUSDT", "TONUSDT",
  "SUIUSDT", "APTUSDT", "ARBUSDT", "OPUSDT", "INJUSDT"];
export const TIMEFRAMES = ["5m", "15m", "1h", "4h"];

// Everything below here was TS interfaces — they're just docs in JS.
// Bias = "bullish" | "bearish" | "ranging"
// ConnectionStatus = "connected" | "delayed" | "unavailable"
// Candle: { openTime, closeTime, open, high, low, close, volume, closed }
// SwingPoint: { index, timestamp, price, kind: "high"|"low" }
// StructureEvent: { id, timestamp, timeframe, type, direction, price, detail }
// LiquidityLevel: { id, price, type, direction, createdAt, swept, sweepTimestamp, distancePct }
// FairValueGap: { id, direction, lower, upper, createdAt, filled, distancePct }
// OrderBlock: { id, direction, lower, upper, createdAt, mitigated, relevant }
// SuggestedSetup: { direction, entry, stopLoss, tp1, tp2, riskReward, explanation }
// TimeframeAnalysis: { timeframe, bias, confirmation, lastEventAt, liquidity, fairValueGaps, orderBlocks, timeline, setup }
// MarketSnapshot: { symbol, price, change24h, fundingRate, openInterest, previousDayHigh, previousDayLow, updatedAt, status, analyses, watchlist, error }
