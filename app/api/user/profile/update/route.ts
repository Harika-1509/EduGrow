import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/lib/models/User";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { currentEmail, firstName, lastName, email, phone, domain } = body;

    if (!currentEmail) {
      return NextResponse.json({ error: "currentEmail is required" }, { status: 400 });
    }

    // Find the current user by their existing email
    const user = await User.findOne({ email: currentEmail });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If email is changing, ensure the new email is not already taken by another user
    if (email && email !== currentEmail) {
      const existing = await User.findOne({ email });
      if (existing) {
        return NextResponse.json({ error: "Email already in use" }, { status: 409 });
      }
      user.email = email;
    }

    if (typeof firstName === "string") user.firstName = firstName;
    if (typeof lastName === "string") user.lastName = lastName;
    if (typeof phone === "string") user.phone = phone;
    if (typeof domain === "string") user.domain = domain;

    await user.save();

    const { password, ...userWithoutPassword } = user.toObject();
    return NextResponse.json({ success: true, user: userWithoutPassword });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}


