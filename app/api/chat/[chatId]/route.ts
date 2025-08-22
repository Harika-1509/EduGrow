import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Message } from "@/lib/models/Message";
import { GeminiService } from "@/lib/services/geminiService";

export async function POST(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    await dbConnect();
    const { content } = await request.json();
    if (!content) {
      return NextResponse.json({ error: "Missing content" }, { status: 400 });
    }

    const reply = await GeminiService.generateChatResponse(content);

    const botMessage = await Message.create({ chatId: params.chatId, content: reply, role: "bot" });

    return NextResponse.json({ success: true, message: botMessage });
  } catch (error: any) {
    console.error("Chat route error:", error);
    return NextResponse.json({ error: error.message || "Chat failed" }, { status: 500 });
  }
}


