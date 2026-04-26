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
return { error: "Invalid token", status: 401 };
}
}

export function requireRole(user, role) {
if (user.role !== role) {
return NextResponse.json(
{ message: "Access denied" },
{ status: 403 }
);
}
}
