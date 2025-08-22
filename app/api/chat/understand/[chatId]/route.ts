import { NextRequest, NextResponse } from "next/server";
import { GeminiService } from "@/lib/services/geminiService";

export async function POST(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const { content } = await request.json();
    if (!content) return NextResponse.json({ error: 'Missing content' }, { status: 400 });
    const result = await GeminiService.understandUserInput(content);
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('Understand route error:', error);
    return NextResponse.json({ error: error.message || 'Failed to understand' }, { status: 500 });
  }
}


