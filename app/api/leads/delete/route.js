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

const { leadId } = await req.json();

if (!leadId) {
  return NextResponse.json(
    { message: "leadId is required" },
    { status: 400 }
  );
}

await connectDB();

const lead = await Lead.findById(leadId);

if (!lead) {
  return NextResponse.json(
    { message: "Lead not found" },
    { status: 404 }
  );
}

// Agent restriction
if (auth.user.role === "agent") {
  if (lead.assignedTo?.toString() !== auth.user.userId) {
    return NextResponse.json(
      { message: "Not your lead" },
      { status: 403 }
    );
  }
}

await Lead.findByIdAndDelete(leadId);

// Activity log
await ActivityLog.create({
  leadId: leadId,
  action: "deleted",
  performedBy: auth.user.userId,
  details: "Lead deleted",
});

return NextResponse.json(
  { message: "Lead deleted successfully" },
  { status: 200 }
);

} catch (error) {
return NextResponse.json(
{ message: "Server error", error: error.message },
{ status: 500 }
);
}
}
