import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { verifyToken } from "@/middleware/auth";

export async function GET(req) {
try {
const auth = verifyToken(req);

// 🔒 Auth check
if (auth.error) {
  return NextResponse.json(
    { message: auth.error },
    { status: auth.status }
  );
}

// 🔒 Only admin allowed
if (auth.user.role !== "admin") {
  return NextResponse.json(
    { message: "Access denied" },
    { status: 403 }
  );
}

await connectDB();

// 🔥 Fetch only agents
const agents = await User.find({ role: "agent" }).select(
  "_id name email"
);

return NextResponse.json({ agents });

} catch (error) {
return NextResponse.json(
{ message: "Server error", error: error.message },
{ status: 500 }
);
}
}
