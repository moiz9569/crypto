import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.warn("[mongoose] MONGODB_URI not set — auth will fail.");
}

let cached = global._mongooseConn;
if (!cached) {
  cached = global._mongooseConn = { conn: null, promise: null };
}

export async function connectMongoose() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      dbName: process.env.MONGODB_DB || "liquidity_bias",
      bufferCommands: false,
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
