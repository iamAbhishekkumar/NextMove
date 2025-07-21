import mongoose, { Connection } from "mongoose";

const { DBUSER, PASSWORD, CLUSTER, DBNAME } = process.env;

if (!DBUSER || !PASSWORD || !CLUSTER || !DBNAME) {
  throw new Error(
    "Missing one or more required MongoDB environment variables."
  );
}

const MONGODB_URI = `mongodb+srv://${DBUSER}:${PASSWORD}@${CLUSTER}.mongodb.net/${DBNAME}?retryWrites=true&w=majority&appName=${DBNAME}`;

// Extend Node.js global to store the cached connection
declare global {
  // eslint-disable-next-line no-var
  var _mongoose:
    | {
        conn: Connection | null;
        promise: Promise<Connection> | null;
      }
    | undefined;
}

const globalMongoose = globalThis as typeof globalThis & {
  _mongoose?: {
    conn: Connection | null;
    promise: Promise<Connection> | null;
  };
};

// Initialize cache
if (!globalMongoose._mongoose) {
  globalMongoose._mongoose = { conn: null, promise: null };
}

async function dbConnect(): Promise<Connection> {
  const cached = globalMongoose._mongoose!;

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
      })
      .then(() => mongoose.connection); // ✅ fix here
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null; // reset on failure
    throw error;
  }

  return cached.conn;
}
export default dbConnect;
