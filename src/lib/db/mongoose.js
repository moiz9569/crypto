import mongoose from "mongoose";
import dns from "node:dns";

dns.setServers(["1.1.1.1", "1.0.0.1"]);

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.warn("[mongoose] MONGODB_URI not set — auth will fail.");
}

let cached = global._mongooseConn;

if (!cached) {
  cached = global._mongooseConn = {
    conn: null,
    promise: null,
  };
}

export async function connectMongoose() {
  if (!uri) {
    throw new Error("MONGODB_URI is not configured");
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;

  return cached.conn;
}