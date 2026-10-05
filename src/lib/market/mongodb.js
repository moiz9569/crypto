import { MongoClient } from "mongodb";
import dns from "node:dns";

dns.setServers(["1.1.1.1", "1.0.0.1"]);
const uri = process.env.MONGODB_URI;

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

  // Uses liquidity_bias from the URI.
  return c.db();
}