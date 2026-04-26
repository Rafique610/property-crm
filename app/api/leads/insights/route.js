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

let filter = {};

if (auth.user.role === "agent") {
  filter.assignedTo = auth.user.userId;
}

const now = new Date();

// Overdue leads
const overdueLeads = await Lead.find({
  ...filter,
  followUpDate: { $lt: now }
});

// Inactive leads (7 days)
const sevenDaysAgo = new Date();
sevenDaysAgo.setDate(now.getDate() - 7);

const inactiveLeads = await Lead.find({
  ...filter,
  lastActivity: { $lt: sevenDaysAgo }
});

return NextResponse.json(
  {
    overdueLeads,
    inactiveLeads
  },
  { status: 200 }
);

} catch (error) {
return NextResponse.json(
{ message: "Server error", error: error.message },
{ status: 500 }
);
}
}
