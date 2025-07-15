// lib/mongoose.ts

import mongoose from "mongoose";

const DBUSER = process.env.DBUSER!;
const PASSWORD = process.env.PASSWORD!;
const CLUSTER = process.env.CLUSTER!;
const DBNAME = process.env.DBNAME!;

const MONGODB_URI = `mongodb+srv://${DBUSER}:${PASSWORD}@${CLUSTER}.mongodb.net/${DBNAME}?retryWrites=true&w=majority`;
if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
