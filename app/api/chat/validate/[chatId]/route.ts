import { NextRequest, NextResponse } from "next/server";
import { GeminiService } from "@/lib/services/geminiService";

export async function POST(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const { content, currentQuestion } = await request.json();
    if (!content || !currentQuestion) {
      return NextResponse.json({ error: 'Missing content or currentQuestion' }, { status: 400 });
    }
    const result = await GeminiService.validateResponse(content, currentQuestion);
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('Validate route error:', error);
    return NextResponse.json({ error: error.message || 'Failed to validate' }, { status: 500 });
  }
}
