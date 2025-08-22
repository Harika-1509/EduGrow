import { NextRequest, NextResponse } from "next/server";
import { RoadmapService } from "@/lib/services/roadmapService";

export async function GET(
  request: NextRequest,
  { params }: { params: { email: string } }
) {
  try {
    const userEmail = decodeURIComponent(params.email);
    const roadmaps = await RoadmapService.getRoadmapsByUserEmail(userEmail);

    return NextResponse.json({
      success: true,
      roadmaps
    });
  } catch (error: any) {
    console.error("Get roadmaps by email error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get roadmaps" },
      { status: 500 }
    );
  }
}
