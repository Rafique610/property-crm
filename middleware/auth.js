import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export function verifyToken(request) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return { error: "No token provided", status: 401 };
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { user: decoded };
  } catch (error) {
    return { error: "Invalid or expired token", status: 401 };
  }
}

/**
 * Returns a NextResponse (forbidden) if user does NOT have the required role,
 * or null if the role check passes.
 */
export function requireRole(user, role) {
  if (user.role !== role) {
    return NextResponse.json({ message: "Access denied" }, { status: 403 });
  }
  return null; // ✅ explicitly return null when check passes
}