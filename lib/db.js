import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
throw new Error("Please define MONGODB_URI in .env.local");
}

// Global cache (prevents multiple connections in Next.js)
let cached = global.mongoose;

if (!cached) {
cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
// If already connected → reuse
if (cached.conn) {
return cached.conn;
}

// If connection is in progress → wait for it
if (!cached.promise) {
cached.promise = mongoose.connect(MONGODB_URI, {
dbName: "property-crm",
bufferCommands: false,
});
}

try {
cached.conn = await cached.promise;
} catch (error) {
cached.promise = null;
throw error;
}

return cached.conn;
}

export default connectDB;
