// import { SYMBOLS, TIMEFRAMES } from "@/lib/market/types";

// /**
//  * Demo data shown ONLY when the backend cannot be reached (or has no data yet).
//  * It has exactly the same shape that `fetchMarketAnalysis` returns, so the
//  * dashboard needs no special cases. The snapshot carries `source: "demo"` so
//  * the UI can label it clearly. These numbers are NOT real market data.
//  */

// const BASE = {
//   BTCUSDT: { price: 68420.5, change24h: 1.24, funding: 0.01, oi: 8.4e9, bias: ["bullish", "bullish", "ranging", "bearish"] },
//   ETHUSDT: { price: 3542.8, change24h: -0.42, funding: 0.006, oi: 4.1e9, bias: ["ranging", "bullish", "ranging", "ranging"] },
//   SOLUSDT: { price: 172.35, change24h: -2.15, funding: -0.004, oi: 1.7e9, bias: ["bearish", "bearish", "bearish", "ranging"] },
//   BNBUSDT: { price: 598.4, change24h: 0.87, funding: 0.008, oi: 0.9e9, bias: ["bullish", "bullish", "ranging", "bullish"] },
//   XRPUSDT: { price: 0.5423, change24h: -1.08, funding: 0.005, oi: 0.7e9, bias: ["ranging", "bearish", "bearish", "bearish"] },
// };

// // how wide the levels sit from price on each timeframe (bigger timeframe = wider)
// const SPREAD = { "5m": 0.35, "15m": 0.6, "1h": 1.1, "4h": 2.0 };
// const MIN = 60_000;

// function analysisFor(symbol, tf, index, price) {
//   const { bias } = BASE[symbol];
//   const b = bias[index];
//   const k = SPREAD[tf] / 100; // spread as a fraction of price
//   const r = (v) => Number(v.toFixed(price >= 1000 ? 2 : price >= 1 ? 3 : 5));
//   const now = Date.now();

//   const lvl = (direction, mult, type, swept = false) => ({
//     direction,
//     price: r(price * (direction === "above" ? 1 + k * mult : 1 - k * mult)),
//     type,
//     swept,
//     distancePct: Number((k * mult * 100).toFixed(2)),
//   });
//   const liquidity = [
//     lvl("above", 1.0, "Equal highs"),
//     lvl("above", 2.2, "Previous day high"),
//     lvl("below", 0.9, "Swing low"),
//     lvl("below", 2.0, "Previous day low"),
//     lvl("below", 1.4, "Asia session low", true),
//   ];

//   const fairValueGaps = [
//     { direction: "bullish", lower: r(price * (1 - k * 0.6)), upper: r(price * (1 - k * 0.25)), filled: false, distancePct: Number((k * 25).toFixed(2)) },
//     { direction: "bearish", lower: r(price * (1 + k * 0.5)), upper: r(price * (1 + k * 0.8)), filled: false, distancePct: Number((k * 50).toFixed(2)) },
//     { direction: "bullish", lower: r(price * (1 - k * 1.8)), upper: r(price * (1 - k * 1.4)), filled: true, distancePct: Number((k * 140).toFixed(2)) },
//   ];

//   const orderBlocks = [
//     { direction: "bullish", lower: r(price * (1 - k * 1.1)), upper: r(price * (1 - k * 0.8)), mitigated: false, distancePct: Number((k * 80).toFixed(2)), relevant: k * 80 <= 1.5 },
//     { direction: "bearish", lower: r(price * (1 + k * 1.2)), upper: r(price * (1 + k * 1.5)), mitigated: false, distancePct: Number((k * 120).toFixed(2)), relevant: k * 120 <= 1.5 },
//     { direction: "bullish", lower: r(price * (1 - k * 2.4)), upper: r(price * (1 - k * 2.1)), mitigated: true, distancePct: Number((k * 210).toFixed(2)), relevant: false },
//   ];

//   const dir = b === "bearish" ? "bearish" : "bullish";
//   const opp = dir === "bullish" ? "bearish" : "bullish";
//   const timeline = [
//     { id: `${symbol}-${tf}-d1`, direction: dir, type: "BOS", detail: `Close beyond ${dir === "bullish" ? "swing high" : "swing low"} (demo)`, timestamp: now - 22 * MIN, price: r(price * (dir === "bullish" ? 1 + k * 0.2 : 1 - k * 0.2)) },
//     { id: `${symbol}-${tf}-d2`, direction: dir, type: "CHoCH", detail: "Change of character (demo)", timestamp: now - 95 * MIN, price: r(price * (1 - k * 0.1)) },
//     { id: `${symbol}-${tf}-d3`, direction: opp, type: "SWEEP", detail: "Liquidity swept and reclaimed (demo)", timestamp: now - 190 * MIN, price: r(price * (1 + k * 0.1)) },
//   ];

//   let setup = null;
//   if (b !== "ranging") {
//     const long = b === "bullish";
//     const entry = r(price * (long ? 1 - k * 0.3 : 1 + k * 0.3));
//     const stopLoss = r(price * (long ? 1 - k * 1.2 : 1 + k * 1.2));
//     const tp1 = r(price * (long ? 1 + k * 1.0 : 1 - k * 1.0));
//     const tp2 = r(price * (long ? 1 + k * 2.2 : 1 - k * 2.2));
//     setup = {
//       direction: long ? "long" : "short",
//       entry,
//       stopLoss,
//       tp1,
//       tp2,
//       riskReward: Number((Math.abs(tp1 - entry) / Math.abs(entry - stopLoss)).toFixed(1)),
//       explanation: `Demo setup: ${long ? "sell-side" : "buy-side"} liquidity was swept and reclaimed, with an unfilled gap near entry.`,
//     };
//   }

//   return {
//     bias: b,
//     confirmation: b === "ranging" ? "No confirmation" : index % 2 ? "CHoCH" : "BOS",
//     lastEventAt: now - 22 * MIN,
//     setup,
//     liquidity,
//     fairValueGaps,
//     orderBlocks,
//     timeline,
//   };
// }

// export function getDemoSnapshot(symbol, reason = "Backend unreachable") {
//   const sym = BASE[symbol] ? symbol : SYMBOLS[0];
//   const { price, change24h, funding, oi } = BASE[sym];

//   const analyses = Object.fromEntries(
//     TIMEFRAMES.map((tf, i) => [tf, analysisFor(sym, tf, i, price)]),
//   );

//   return {
//     source: "demo",
//     demoReason: reason,
//     price,
//     change24h,
//     fundingRate: funding,
//     openInterest: oi,
//     previousDayHigh: Number((price * 1.018).toFixed(price >= 1000 ? 2 : 4)),
//     previousDayLow: Number((price * 0.972).toFixed(price >= 1000 ? 2 : 4)),
//     updatedAt: Date.now(),
//     analyses,
//     watchlist: SYMBOLS.map((s) => ({
//       symbol: s,
//       price: BASE[s].price,
//       change24h: BASE[s].change24h,
//       biasByTimeframe: Object.fromEntries(TIMEFRAMES.map((tf, i) => [tf, BASE[s].bias[i]])),
//     })),
//   };
// }
