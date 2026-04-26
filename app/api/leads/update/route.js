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

const { leadId, status, notes, assignedTo } = await req.json();

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

let changes = [];

// Update status
if (status) {
  lead.status = status;
  changes.push(`Status updated to ${status}`);
}

// Update notes
if (notes) {
  lead.notes = notes;
  changes.push("Notes updated");
}

// Admin-only assignment
if (assignedTo) {
  if (auth.user.role !== "admin") {
    return NextResponse.json(
      { message: "Only admin can reassign leads" },
      { status: 403 }
    );
  }

  lead.assignedTo = assignedTo;
  changes.push("Lead reassigned");
}

lead.lastActivity = new Date();
await lead.save();

// Activity log
await ActivityLog.create({
  leadId: lead._id,
  action: "updated",
  performedBy: auth.user.userId,
  details: changes.join(", "),
});

return NextResponse.json(
  { message: "Lead updated successfully", lead },
  { status: 200 }
);

} catch (error) {
return NextResponse.json(
{ message: "Server error", error: error.message },
{ status: 500 }
);
}
}
