import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Roadmap } from "@/lib/models/Roadmap";
import { GeminiService } from "@/lib/services/geminiService";

export async function POST(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    await dbConnect();
    const roadmap = await Roadmap.findOne({ chatId: params.chatId });
    if (!roadmap) {
      return NextResponse.json({ error: "Roadmap not found" }, { status: 404 });
    }

    const { domain, goal, priorKnowledge } = roadmap;
    const options = await GeminiService.suggestTracks(domain, goal || "", priorKnowledge || undefined);
    return NextResponse.json({ success: true, options });
  } catch (error: any) {
    console.error("Suggest tracks error:", error);
    return NextResponse.json({ error: error.message || "Failed to suggest tracks" }, { status: 500 });
  }
}


