// FILE: app/api/leads/route.js

import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Lead from "@/models/Lead";
import { verifyToken } from "@/middleware/auth";

export async function GET(req) {
  try {
    const auth = verifyToken(req);

    if (auth.error) {
      return NextResponse.json({ message: auth.error }, { status: auth.status });
    }

    await connectDB();

    let filter = {};

    // ✅ Agents only see their own assigned leads
    if (auth.user.role === "agent") {
      filter.assignedTo = auth.user.userId;
    }

    const leads = await Lead.find(filter)
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });

    return NextResponse.json({ leads }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}