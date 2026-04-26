import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Lead from "@/models/Lead";
import ActivityLog from "@/models/ActivityLog";
import { verifyToken } from "@/middleware/auth";

export async function POST(req) {
try {
const auth = verifyToken(req);

if (auth.error) {
  return NextResponse.json(
    { message: auth.error },
    { status: auth.status }
  );
}

const { name, email, propertyInterest, budget, notes } = await req.json();

if (!name || !email || !propertyInterest || !budget) {
  return NextResponse.json(
    { message: "Missing required fields" },
    { status: 400 }
  );
}

await connectDB();

// Create lead (score handled in model middleware)
const lead = await Lead.create({
  name,
  email,
  propertyInterest,
  budget,
  notes,
  status: "New",
});

// Activity log
await ActivityLog.create({
  leadId: lead._id,
  action: "created",
  performedBy: auth.user.userId,
  details: `Lead created by user`,
});

return NextResponse.json(
  { message: "Lead created successfully", lead },
  { status: 201 }
);

} catch (error) {
return NextResponse.json(
{ message: "Server error", error: error.message },
{ status: 500 }
);
}
}
