import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Lead from "@/models/Lead";
import User from "@/models/User";
import { verifyToken, requireRole } from "@/middleware/auth";
import ActivityLog from "@/models/ActivityLog";

export async function POST(req) {
try {
const auth = verifyToken(req);

if (auth.error) {
  return NextResponse.json(
    { message: auth.error },
    { status: auth.status }
  );
}

// Only admin allowed
const roleCheck = requireRole(auth.user, "admin");
if (roleCheck) return roleCheck;

const { leadId, agentId } = await req.json();

if (!leadId || !agentId) {
  return NextResponse.json(
    { message: "leadId and agentId are required" },
    { status: 400 }
  );
}

await connectDB();

const agent = await User.findById(agentId);

if (!agent || agent.role !== "agent") {
  return NextResponse.json(
    { message: "Invalid agent" },
    { status: 400 }
  );
}

const lead = await Lead.findById(leadId);

if (!lead) {
  return NextResponse.json(
    { message: "Lead not found" },
    { status: 404 }
  );
}

lead.assignedTo = agentId;
await lead.save();

await ActivityLog.create({
leadId: lead._id,
action: "assigned",
performedBy: auth.user.userId,
details: `Lead assigned to agent ${agent.name}`,
});

return NextResponse.json(
  { message: "Lead assigned successfully", lead },
  { status: 200 }
);

} catch (error) {
return NextResponse.json(
{ message: "Server error", error: error.message },
{ status: 500 }
);
}
}