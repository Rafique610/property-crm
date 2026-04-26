// FILE: app/api/leads/analytics/route.js

import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Lead from "@/models/Lead";
import User from "@/models/User";
import { verifyToken } from "@/middleware/auth";

export async function GET(req) {
  try {
    const auth = verifyToken(req);

    if (auth.error) {
      return NextResponse.json({ message: auth.error }, { status: auth.status });
    }

    if (auth.user.role !== "admin") {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    await connectDB();

    const totalLeads = await Lead.countDocuments();

    const statusStats = await Lead.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const priorityStats = await Lead.aggregate([
      { $group: { _id: "$score", count: { $sum: 1 } } },
    ]);

    // ✅ FIX: Populate agent names so dashboard shows real names, not compressed IDs
    const agentStatsRaw = await Lead.aggregate([
      { $match: { assignedTo: { $ne: null } } },
      { $group: { _id: "$assignedTo", totalLeads: { $sum: 1 } } },
    ]);

    // Fetch agent names for each agent ID
    const agentIds = agentStatsRaw.map((a) => a._id);
    const agents = await User.find({ _id: { $in: agentIds } }).select("_id name email");
    const agentMap = {};
    agents.forEach((a) => { agentMap[a._id.toString()] = a; });

    const agentStats = agentStatsRaw.map((a) => ({
      _id: a._id,
      totalLeads: a.totalLeads,
      name: agentMap[a._id?.toString()]?.name || "Unknown Agent",
      email: agentMap[a._id?.toString()]?.email || "",
    }));

    return NextResponse.json({ totalLeads, statusStats, priorityStats, agentStats });
  } catch (error) {
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}