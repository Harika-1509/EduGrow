import { NextRequest, NextResponse } from "next/server";
import { RoadmapService } from "@/lib/services/roadmapService";

export async function POST(request: NextRequest) {
  try {
    const { userId, firstName, domain } = await request.json();

    if (!userId || !firstName || !domain) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const roadmap = await RoadmapService.createRoadmap(userId, firstName, domain);

    return NextResponse.json({
      success: true,
      roadmap
    });
  } catch (error: any) {
    console.error("Create roadmap error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create roadmap" },
      { status: 500 }
    );
  }
}
