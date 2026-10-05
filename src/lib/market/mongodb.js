import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "liquidity_bias";

if (!uri) {
  console.warn("[mongo] MONGODB_URI not set — snapshot cache disabled.");
}

let client;
let clientPromise;

if (uri) {
  if (process.env.NODE_ENV === "development") {
    // Reuse across HMR reloads.
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    client = new MongoClient(uri);
    clientPromise = client.connect();
  }
}

export async function getDb() {
  if (!clientPromise) return null;
  const c = await clientPromise;
  return c.db(dbName);
}
