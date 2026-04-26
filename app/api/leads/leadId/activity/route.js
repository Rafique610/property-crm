import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import ActivityLog from "@/models/ActivityLog";
import { verifyToken } from "@/middleware/auth";

export async function GET(req, { params }) {
  try {
    const auth = verifyToken(req);
    if (auth.error) {
      return NextResponse.json({ message: auth.error }, { status: auth.status });
    }

    const { leadId } = params;
    await connectDB();

    const logs = await ActivityLog.find({ leadId })
      .sort({ createdAt: -1 })
      .populate("performedBy", "name email")
      .limit(50);

    return NextResponse.json({ logs });
  } catch (error) {
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}