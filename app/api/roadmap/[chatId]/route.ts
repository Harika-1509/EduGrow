import { NextRequest, NextResponse } from "next/server";
import { RoadmapService } from "@/lib/services/roadmapService";

export async function GET(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const roadmap = await RoadmapService.getRoadmapByChatId(params.chatId);

    if (!roadmap) {
      return NextResponse.json(
        { error: "Roadmap not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      roadmap
    });
  } catch (error: any) {
    console.error("Get roadmap error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get roadmap" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const { todoList } = await request.json();

    const roadmap = await RoadmapService.updateTodoList(params.chatId, todoList);

    if (!roadmap) {
      return NextResponse.json(
        { error: "Roadmap not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      roadmap
    });
  } catch (error: any) {
    console.error("Update roadmap error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update roadmap" },
      { status: 500 }
    );
  }
}
