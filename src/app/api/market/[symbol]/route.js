import { NextResponse } from "next/server";
import { SYMBOLS } from "@/lib/market/types";
import { getMarketSnapshot } from "@/lib/market/binance";
import {
  readCachedSnapshot,
  writeCachedSnapshot,
  recordStructureEvents,
} from "@/lib/market/cache";

export const dynamic = "force-dynamic";

export async function GET(_req, { params }) {
  const { symbol } = await params;
  if (!SYMBOLS.includes(symbol)) {
    return NextResponse.json({ error: "Unknown symbol" }, { status: 400 });
  }

  // 1) MongoDB cache hit?
  const cached = await readCachedSnapshot(symbol);
  if (cached) {
    return NextResponse.json(cached, { headers: { "x-cache": "hit" } });
  }

  // 2) Fresh fetch from Binance.
  try {
    const snapshot = await getMarketSnapshot(symbol);
    await writeCachedSnapshot(symbol, snapshot);
    // Fire-and-forget history write; don't block the response.
    recordStructureEvents(symbol, snapshot.analyses).catch(() => {});
    return NextResponse.json(snapshot, { headers: { "x-cache": "miss" } });
  } catch (err) {
    console.error("[api/market] failed", err);
    return NextResponse.json(
      { error: "Live market data is temporarily unavailable." },
      { status: 503 },
    );
  }
}
