import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Message } from "@/lib/models/Message";

export async function GET(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    await dbConnect();
    const messages = await Message.find({ chatId: params.chatId }).sort({ createdAt: 1 });
    return NextResponse.json({ success: true, messages });
  } catch (error: any) {
    console.error("Messages GET error:", error);
    return NextResponse.json({ error: error.message || "Failed to get messages" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    await dbConnect();
    const { content, role } = await request.json();
    if (!content || !role) {
      return NextResponse.json({ error: "Missing content or role" }, { status: 400 });
    }
    const message = await Message.create({ chatId: params.chatId, content, role });
    return NextResponse.json({ success: true, message });
  } catch (error: any) {
    console.error("Messages POST error:", error);
    return NextResponse.json({ error: error.message || "Failed to create message" }, { status: 500 });
  }
}


