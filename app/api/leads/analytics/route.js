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

if (auth.user.role !== "admin") {
     return NextResponse.json( 
        { message: "Access denied" }, 
        { status: 403 } 
    ); 
}

await connectDB();

// 🔥 Total leads
const totalLeads = await Lead.countDocuments();

// 🔥 Leads by status
const statusStats = await Lead.aggregate([
  {
    $group: {
      _id: "$status",
      count: { $sum: 1 }
    }
  }
]);

// 🔥 Leads by priority (score)
const priorityStats = await Lead.aggregate([
  {
    $group: {
      _id: "$score",
      count: { $sum: 1 }
    }
  }
]);

// 🔥 Agent performance
const agentStats = await Lead.aggregate([
  {
    $group: {
      _id: "$assignedTo",
      totalLeads: { $sum: 1 }
    }
  }
]);

return NextResponse.json({
  totalLeads,
  statusStats,
  priorityStats,
  agentStats
});

} catch (error) {
return NextResponse.json(
{ message: "Server error", error: error.message },
{ status: 500 }
);
}
}
