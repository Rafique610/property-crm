import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Lead from "@/models/Lead";
import { verifyToken } from "@/middleware/auth";

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

let leads;

// Admin → all leads
if (auth.user.role === "admin") {
  leads = await Lead.find().populate("assignedTo", "name email");
} 
// Agent → only assigned leads
else {
  leads = await Lead.find({ assignedTo: auth.user.userId })
    .populate("assignedTo", "name email");
}

return NextResponse.json({ leads }, { status: 200 });

} catch (error) {
return NextResponse.json(
{ message: "Server error", error: error.message },
{ status: 500 }
);
}
}