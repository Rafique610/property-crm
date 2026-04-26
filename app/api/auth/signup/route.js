import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST(req) {
try {
const { name, email, password } = await req.json();

// Basic validation
if (!name || !email || !password) {
  return NextResponse.json(
    { message: "All fields are required" },
    { status: 400 }
  );
}

await connectDB();

// Check if user already exists
const existingUser = await User.findOne({ email });

if (existingUser) {
  return NextResponse.json(
    { message: "User already exists" },
    { status: 400 }
  );
}

// Create new user
const user = await User.create({
  name,
  email,
  password, // will be hashed automatically
});

return NextResponse.json(
  { message: "User created successfully", user },
  { status: 201 }
);

} catch (error) {
return NextResponse.json(
{ message: "Server error", error: error.message },
{ status: 500 }
);
}
}
