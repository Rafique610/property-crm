// FILE: app/api/leads/create/route.js — FIXED (dynamic email import)

import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Lead from "@/models/Lead";
import User from "@/models/User";
import ActivityLog from "@/models/ActivityLog";
import { verifyToken } from "@/middleware/auth";
import { checkRateLimit } from "@/middleware/rateLimit";

export async function POST(req) {
  try {
    // ── Auth ──────────────────────────────────────────────────────────
    const auth = verifyToken(req);
    if (auth.error) {
      return NextResponse.json({ message: auth.error }, { status: auth.status });
    }

    // ── Rate limit (agents: 50 req/min, admins: unlimited) ───────────
    const rateCheck = checkRateLimit(auth.user);
    if (rateCheck) {
      return NextResponse.json(
        { message: rateCheck.error },
        {
          status: rateCheck.status,
          headers: { "Retry-After": String(rateCheck.retryAfter) },
        }
      );
    }

    // ── Validate body ─────────────────────────────────────────────────
    const body = await req.json();
    const { name, email, phone, propertyInterest, budget, notes } = body;

    if (!name || !email || !propertyInterest || !budget) {
      return NextResponse.json(
        { message: "Missing required fields: name, email, propertyInterest, budget" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: "Invalid email format" }, { status: 400 });
    }

    const budgetNum = Number(budget);
    if (isNaN(budgetNum) || budgetNum <= 0) {
      return NextResponse.json(
        { message: "Budget must be a positive number" },
        { status: 400 }
      );
    }

    // ── DB ────────────────────────────────────────────────────────────
    await connectDB();

    const lead = await Lead.create({
      name,
      email,
      phone: phone || "",
      propertyInterest,
      budget: budgetNum,
      notes: notes || "",
      status: "New",
    });

    // ── Activity log ──────────────────────────────────────────────────
    await ActivityLog.create({
      leadId: lead._id,
      action: "created",
      performedBy: auth.user.userId,
      details: `Lead created — budget PKR ${budgetNum.toLocaleString()} — priority: ${lead.score}`,
    });

    // ── Email admins (dynamic import — nodemailer can NEVER crash the route) ──
    if (process.env.SMTP_USER) {
      try {
        const { sendLeadCreatedEmail } = await import("@/lib/email");
        const admins = await User.find({ role: "admin" }).select("email");
        for (const admin of admins) {
          await sendLeadCreatedEmail(lead, admin.email);
        }
      } catch (emailErr) {
        console.warn("Email notification skipped:", emailErr.message);
      }
    }

    return NextResponse.json(
      { message: "Lead created successfully", lead },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create lead error:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}