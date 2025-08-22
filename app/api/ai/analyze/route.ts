import { NextRequest, NextResponse } from "next/server";
import { GeminiService } from "@/lib/services/geminiService";

export async function POST(request: NextRequest) {
  try {
    const { prompt, type, answers } = await request.json();

    if (type === 'course-ranking') {
      if (!prompt) {
        return NextResponse.json(
          { error: "Prompt is required for course ranking" },
          { status: 400 }
        );
      }

      const response = await GeminiService.generateText(prompt);
      
      return NextResponse.json({
        success: true,
        response
      });
    }

    // Handle onboarding analysis (existing functionality)
    if (!answers) {
      return NextResponse.json(
        { error: "Answers are required" },
        { status: 400 }
      );
    }

    const analysis = await GeminiService.analyzeOnboardingAnswers(answers);

    return NextResponse.json({
      success: true,
      analysis
    });
  } catch (error: any) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze" },
      { status: 500 }
    );
  }
}
