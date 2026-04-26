// FILE: app/api/leads/update/route.js

import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Lead from "@/models/Lead";
import User from "@/models/User";
import ActivityLog from "@/models/ActivityLog";
import { verifyToken } from "@/middleware/auth";

let sendLeadAssignedEmail = async () => {};
try {
  const emailLib = await import("@/lib/email");
  sendLeadAssignedEmail = emailLib.sendLeadAssignedEmail;
} catch (_) {}

export async function POST(req) {
  try {
    const auth = verifyToken(req);
    if (auth.error) {
      return NextResponse.json({ message: auth.error }, { status: auth.status });
    }

    const { leadId, status, notes, assignedTo } = await req.json();

    if (!leadId) {
      return NextResponse.json({ message: "leadId is required" }, { status: 400 });
    }

    await connectDB();

    const lead = await Lead.findById(leadId);
    if (!lead) {
      return NextResponse.json({ message: "Lead not found" }, { status: 404 });
    }

    // Agents can only edit their own assigned leads
    if (auth.user.role === "agent") {
      if (lead.assignedTo?.toString() !== auth.user.userId) {
        return NextResponse.json({ message: "Not your lead" }, { status: 403 });
      }
    }

    const changes = [];

    if (status) {
      lead.status = status;
      changes.push(`Status → ${status}`);
    }

    if (notes !== undefined && notes !== null) {
      lead.notes = notes;
      changes.push("Notes updated");
    }

    if (assignedTo) {
      if (auth.user.role !== "admin") {
        return NextResponse.json(
          { message: "Only admin can reassign leads" },
          { status: 403 }
        );
      }

      const agent = await User.findById(assignedTo).select("name email");
      if (!agent) {
        return NextResponse.json({ message: "Agent not found" }, { status: 404 });
      }

      lead.assignedTo = assignedTo;
      changes.push(`Assigned to ${agent.name}`);

      // Send assignment email (best-effort)
      try {
        await sendLeadAssignedEmail(lead, agent);
      } catch (emailErr) {
        console.warn("Assignment email failed (non-fatal):", emailErr.message);
      }
    }

    lead.lastActivity = new Date();
    await lead.save();

    await ActivityLog.create({
      leadId: lead._id,
      action: "updated",
      performedBy: auth.user.userId,
      details: changes.join(", ") || "Lead updated",
    });

    return NextResponse.json({ message: "Lead updated successfully", lead }, { status: 200 });
  } catch (error) {
    console.error("Update lead error:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}