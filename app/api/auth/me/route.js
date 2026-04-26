import { NextResponse } from "next/server";
import { verifyToken } from "@/middleware/auth";
import User from "@/models/User";
import connectDB from "@/lib/db";

export async function GET(req) {
try {
const auth = verifyToken(req);

if (auth.error) {
  return NextResponse.json(
    { message: auth.error },
    { status: auth.status }
  );
}

await connectDB();

const user = await User.findById(auth.user.userId).select("-password");

return NextResponse.json({ user });

} catch (error) {
return NextResponse.json(
{ message: "Server error" },
{ status: 500 }
);
}
}
