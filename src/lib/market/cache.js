import { getDb } from "./mongodb";

const SNAPSHOT_TTL_MS = 12_000; // Under the 15s client refresh cadence.

export async function readCachedSnapshot(symbol) {
  try {
    const db = await getDb();
    if (!db) return null;
    const doc = await db.collection("market_snapshots").findOne({ symbol });
    if (!doc) return null;
    if (Date.now() - doc.cachedAt > SNAPSHOT_TTL_MS) return null;
    return doc.snapshot;
  } catch (err) {
    console.error("[cache] read failed", err);
    return null;
  }
}

export async function writeCachedSnapshot(symbol, snapshot) {
  try {
    const db = await getDb();
    if (!db) return;
    await db
      .collection("market_snapshots")
      .updateOne(
        { symbol },
        { $set: { symbol, snapshot, cachedAt: Date.now() } },
        { upsert: true },
      );
  } catch (err) {
    console.error("[cache] write failed", err);
  }
}

/**
 * Append structure events from each timeframe to a persistent history
 * collection. De-duped by event.id. Used for future "history" features.
 */
export async function recordStructureEvents(symbol, analyses) {
  try {
    const db = await getDb();
    if (!db) return;
    const events = [];
    for (const tf of Object.keys(analyses)) {
      for (const ev of analyses[tf].timeline) {
        events.push({ symbol, ...ev });
      }
    }
    if (!events.length) return;
    const ops = events.map((ev) => ({
      updateOne: {
        filter: { id: ev.id },
        update: { $setOnInsert: ev },
        upsert: true,
      },
    }));
    await db.collection("structure_events").bulkWrite(ops, { ordered: false });
  } catch (err) {
    console.error("[history] write failed", err);
  }
}
