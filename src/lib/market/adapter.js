// import { TIMEFRAMES } from "@/lib/market/types";

// const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
// const TF_MS = { "5m": 300000, "15m": 900000, "1h": 3600000, "4h": 14400000 };

// async function apiGet(path) {
//   const res = await fetch(`${API_URL}${path}`, { cache: "no-store" });
//   if (!res.ok) {
//     const body = await res.json().catch(() => null);
//     throw new Error(body?.error?.message ?? body?.message ?? `Request failed (${res.status})`);
//   }
//   return res.json();
// }

// const toBias = (b) => (b === "BULLISH" ? "bullish" : b === "BEARISH" ? "bearish" : "ranging");
// const toDir = (d) => (d === "BULLISH" ? "bullish" : "bearish");
// const confirmation = (t) => (t === "BOS" ? "BOS" : t === "CHOCH" ? "CHoCH" : "No confirmation");

// // % distance from price to a zone (0 if price is inside it)
// const distPct = (price, lo, hi) => {
//   if (!price || (price >= lo && price <= hi)) return 0;
//   return (Math.min(Math.abs(price - lo), Math.abs(price - hi)) / price) * 100;
// };

// function adaptTimeframe(tf, d) {
//   const price = d.liquidity?.price ?? d.statStrip?.markPrice ?? 0;

//   // liquidity: resting levels first (nearest first), recently swept ones after
//   const L = d.liquidity ?? { above: [], below: [], recentlySwept: [] };
//   const level = (z, direction) => ({
//     direction,
//     price: z.level,
//     type: z.label ?? z.type,
//     swept: z.status === "SWEPT",
//     distancePct: Math.abs(z.distancePct ?? 0),
//   });
//   const cut = Date.now() - 12 * TF_MS[tf];
//   const liquidity = [
//     ...L.above.map((z) => level(z, "above")),
//     ...L.below.map((z) => level(z, "below")),
//     ...L.recentlySwept
//       .filter((z) => z.sweptAt >= cut)
//       .map((z) => level(z, z.level > price ? "above" : "below")),
//   ];

//   const fvg = (f, filled) => ({
//     direction: toDir(f.direction),
//     lower: f.bottom,
//     upper: f.top,
//     filled,
//     distancePct: distPct(price, f.bottom, f.top),
//   });
//   const fairValueGaps = [
//     ...(d.fairValueGaps?.unfilled ?? []).map((f) => fvg(f, false)).sort((a, b) => a.distancePct - b.distancePct),
//     ...(d.fairValueGaps?.filled ?? []).map((f) => fvg(f, true)),
//   ];

//   const ob = (o, mitigated) => {
//     const distancePct = distPct(price, o.bottom, o.top);
//     return {
//       direction: toDir(o.direction),
//       lower: o.bottom,
//       upper: o.top,
//       mitigated,
//       distancePct,
//       relevant: !mitigated && distancePct <= 1.5, // "relevant" = within 1.5% of price
//     };
//   };
//   const orderBlocks = [
//     ...(d.orderBlocks?.unmitigated ?? []).map((o) => ob(o, false)).sort((a, b) => a.distancePct - b.distancePct),
//     ...(d.orderBlocks?.mitigated ?? []).map((o) => ob(o, true)),
//   ];

//   const timeline = (d.timeline ?? []).slice(0, 8).map((e) => ({
//     id: e.key,
//     direction: toDir(e.direction),
//     type: e.type === "CHOCH" ? "CHoCH" : e.type,
//     detail: e.message,
//     timestamp: e.time,
//     price: e.price,
//   }));

//   const s = d.suggestedSetup;
//   const setup =
//     s && s.status !== "NONE"
//       ? {
//           direction: s.direction === "LONG" ? "long" : "short",
//           entry: s.entry,
//           stopLoss: s.stopLoss,
//           tp1: s.takeProfit1,
//           tp2: s.takeProfit2 ?? s.takeProfit1, // frontend crashes on undefined
//           riskReward: s.rr1 ?? 0,
//           explanation: s.reason ?? "",
//         }
//       : null;

//   return {
//     bias: toBias(d.biasBanner?.bias),
//     confirmation: confirmation(d.biasBanner?.confirmingEvent?.type),
//     lastEventAt: timeline[0]?.timestamp ?? null,
//     setup,
//     liquidity,
//     fairValueGaps,
//     orderBlocks,
//     timeline,
//   };
// }

// export async function fetchMarketAnalysis(symbol) {
//   const [watch, ...dashes] = await Promise.all([
//     apiGet("/watchlist"),
//     ...TIMEFRAMES.map((tf) =>
//       apiGet(`/symbols/${symbol}/dashboard?tf=${tf}&orderbook=false`),
//     ),
//   ]);

//   const analyses = Object.fromEntries(
//     TIMEFRAMES.map((tf, i) => [tf, adaptTimeframe(tf, dashes[i])]),
//   );
//   const stats = dashes[0].statStrip ?? {};

//   return {
//     price: stats.markPrice ?? dashes[0].liquidity?.price ?? 0,
//     change24h: stats.change24h ?? 0,
//     fundingRate: (stats.fundingRate ?? 0) * 100, // backend: 0.0001 -> frontend: 0.0100%
//     openInterest: stats.openInterestUsd ?? 0,
//     previousDayHigh: stats.previousDayHigh ?? 0,
//     previousDayLow: stats.previousDayLow ?? 0,
//     updatedAt: dashes[0].generatedAt,
//     analyses,
//     watchlist: watch.watchlist.map((w) => ({
//       symbol: w.symbol,
//       price: w.price ?? 0,
//       change24h: w.change24h ?? 0,
//       biasByTimeframe: Object.fromEntries(
//         Object.entries(w.mtf?.biasByTimeframe ?? {}).map(([k, v]) => [k, toBias(v)]),
//       ),
//     })),
//   };
// }
import { TIMEFRAMES } from "@/lib/market/types";
// import { getDemoSnapshot } from "@/lib/market/fallback";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
const REQUEST_TIMEOUT_MS = 8000; // never leave the dashboard hanging on a dead backend
const TF_MS = { "5m": 300000, "15m": 900000, "1h": 3600000, "4h": 14400000 };

async function apiGet(path) {
  const res = await fetch(`${API_URL}${path}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    // backend errors look like { error: "message" }
    const msg =
      typeof body?.error === "string"
        ? body.error
        : (body?.error?.message ?? body?.message);
    throw new Error(msg ?? `Request failed (${res.status})`);
  }
  return res.json();
}

const toBias = (b) =>
  b === "BULLISH" ? "bullish" : b === "BEARISH" ? "bearish" : "ranging";
const toDir = (d) => (d === "BULLISH" ? "bullish" : "bearish");
const confirmation = (t) =>
  t === "BOS" ? "BOS" : t === "CHOCH" ? "CHoCH" : "No confirmation";

// % distance from price to a zone (0 if price is inside it)
const distPct = (price, lo, hi) => {
  if (!price || (price >= lo && price <= hi)) return 0;
  return (Math.min(Math.abs(price - lo), Math.abs(price - hi)) / price) * 100;
};

function adaptTimeframe(tf, d) {
  const price = d.liquidity?.price ?? d.statStrip?.markPrice ?? 0;

  // liquidity: resting levels first (nearest first), recently swept ones after
  const L = d.liquidity ?? { above: [], below: [], recentlySwept: [] };
  const level = (z, direction) => ({
    direction,
    price: z.level,
    type: z.label ?? z.type,
    swept: z.status === "SWEPT",
    distancePct: Math.abs(z.distancePct ?? 0),
  });
  const cut = Date.now() - 12 * TF_MS[tf];
  const liquidity = [
    ...L.above.map((z) => level(z, "above")),
    ...L.below.map((z) => level(z, "below")),
    ...L.recentlySwept
      .filter((z) => z.sweptAt >= cut)
      .map((z) => level(z, z.level > price ? "above" : "below")),
  ];

  const fvg = (f, filled) => ({
    direction: toDir(f.direction),
    lower: f.bottom,
    upper: f.top,
    filled,
    distancePct: distPct(price, f.bottom, f.top),
  });
  const fairValueGaps = [
    ...(d.fairValueGaps?.unfilled ?? [])
      .map((f) => fvg(f, false))
      .sort((a, b) => a.distancePct - b.distancePct),
    ...(d.fairValueGaps?.filled ?? []).map((f) => fvg(f, true)),
  ];

  const ob = (o, mitigated) => {
    const distancePct = distPct(price, o.bottom, o.top);
    return {
      direction: toDir(o.direction),
      lower: o.bottom,
      upper: o.top,
      mitigated,
      distancePct,
      relevant: !mitigated && distancePct <= 1.5, // "relevant" = within 1.5% of price
    };
  };
  const orderBlocks = [
    ...(d.orderBlocks?.unmitigated ?? [])
      .map((o) => ob(o, false))
      .sort((a, b) => a.distancePct - b.distancePct),
    ...(d.orderBlocks?.mitigated ?? []).map((o) => ob(o, true)),
  ];

  const timeline = (d.timeline ?? []).slice(0, 8).map((e) => ({
    id: e.key,
    direction: toDir(e.direction),
    type: e.type === "CHOCH" ? "CHoCH" : e.type,
    detail: e.message,
    timestamp: e.time,
    price: e.price,
  }));

  const s = d.suggestedSetup;
  const setup =
    s && s.status !== "NONE"
      ? {
          status: s.status,
          direction: s.direction === "LONG" ? "long" : "short",
          entry: s.entry,
          stopLoss: s.stopLoss,
          tp1: s.takeProfit1,
          tp2: s.takeProfit2 ?? s.takeProfit1, // frontend crashes on undefined
          riskReward: s.rr1 ?? 0,
          explanation: s.reason ?? "",
        }
      : null;

  return {
    bias: toBias(d.biasBanner?.bias),
    confirmation: confirmation(d.biasBanner?.confirmingEvent?.type),
    lastEventAt: timeline[0]?.timestamp ?? null,
    setup,
    noSetupReason: s?.status === "NONE" ? s.reason : null,
    liquidity,
    fairValueGaps,
    orderBlocks,
    timeline,
  };
}

export async function fetchMarketAnalysis(symbol) {
  const [watch, ...dashes] = await Promise.all([
    apiGet("/watchlist"),
    ...TIMEFRAMES.map((tf) =>
      apiGet(`/symbols/${symbol}/dashboard?tf=${tf}&orderbook=false`),
    ),
  ]);

  const analyses = Object.fromEntries(
    TIMEFRAMES.map((tf, i) => [tf, adaptTimeframe(tf, dashes[i])]),
  );
  const stats = dashes[0].statStrip ?? {};
  const price = stats.markPrice ?? 0;

  // No stat strip (mark price, funding, OI, previous-day levels) means the backend is up but
  // still warming up -> treat as "not fetched" so the caller falls back instead of showing zeros.
  if (!price) throw new Error(`Live stats for ${symbol} are not ready yet`);

  return {
    source: "live",
    price,
    change24h: stats.change24h ?? 0,
    fundingRate: (stats.fundingRate ?? 0) * 100, // backend: 0.0001 -> frontend: 0.0100%
    openInterest: stats.openInterestUsd ?? 0,
    previousDayHigh: stats.previousDayHigh ?? 0,
    previousDayLow: stats.previousDayLow ?? 0,
    updatedAt: dashes[0].generatedAt,
    analyses,
    watchlist: watch.watchlist.map((w) => ({
      symbol: w.symbol,
      price: w.price ?? 0,
      change24h: w.change24h ?? 0,
      biasByTimeframe: Object.fromEntries(
        Object.entries(w.mtf?.biasByTimeframe ?? {}).map(([k, v]) => [
          k,
          toBias(v),
        ]),
      ),
    })),
  };
}

/**
 * What the dashboard calls: live data when the backend answers, demo data when it
 * does not (backend down, still warming up, symbol not on the watchlist, timeout...).
 * Demo snapshots are flagged with `source: "demo"` so the UI can say so.
 */
// export async function fetchMarketAnalysisOrDemo(symbol) {
//   try {
//     return await fetchMarketAnalysis(symbol);
//   } catch (err) {
//     console.warn(
//       `[market] backend unavailable for ${symbol}, showing demo data:`,
//       err.message,
//     );
//     // return getDemoSnapshot(symbol, err.message);
//   }
// }
