import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import jwt from "jsonwebtoken";

export async function POST(req) {
try {
const { email, password } = await req.json();

if (!email || !password) {
  return NextResponse.json(
    { message: "Email and password are required" },
    { status: 400 }
  );
}

await connectDB();

const user = await User.findOne({ email });

if (!user) {
  return NextResponse.json(
    { message: "Invalid credentials" },
    { status: 401 }
  );
}

const isMatch = await user.comparePassword(password);

if (!isMatch) {
  return NextResponse.json(
    { message: "Invalid credentials" },
    { status: 401 }
  );
}

// Generate JWT
const token = jwt.sign(
  {
    userId: user._id,
    role: user.role,
  },
  process.env.JWT_SECRET,
  { expiresIn: "1d" }
);

// Set cookie
const response = NextResponse.json(
  { message: "Login successful" },
  { status: 200 }
);

response.cookies.set("token", token, {
  httpOnly: true,
  secure: false, // true in production (HTTPS)
  sameSite: "strict",
  maxAge: 60 * 60 * 24,
});

return response;

} catch (error) {
return NextResponse.json(
{ message: "Server error", error: error.message },
{ status: 500 }
);
}
}