import { NextRequest, NextResponse } from "next/server";
import { RoadmapService } from "@/lib/services/roadmapService";

export async function POST(request: NextRequest) {
  try {
    const { firstName, domain, userEmail } = await request.json();

    if (!firstName || !domain || !userEmail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Always ensure the collection is properly set up with clean schema
    await RoadmapService.ensureCollection();
    
    // Create roadmap with only the required fields
    const roadmap = await RoadmapService.createRoadmap(firstName, domain, userEmail);

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
