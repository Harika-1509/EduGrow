import { NextRequest, NextResponse } from "next/server";
import { RoadmapService } from "@/lib/services/roadmapService";

export async function POST(request: NextRequest) {
  try {
    await RoadmapService.ensureCollection();
    
    return NextResponse.json({
      success: true,
      message: "Roadmap collection reset successfully"
    });
  } catch (error: any) {
    console.error("Reset roadmap error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to reset roadmap collection" },
      { status: 500 }
    );
  }
}
