import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../[...nextauth]/route";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Return the current session data
    return NextResponse.json({
      success: true,
      session: {
        user: {
          firstName: session.user.firstName,
          lastName: session.user.lastName,
          email: session.user.email,
          phone: session.user.phone,
          onboarding: session.user.onboarding,
          domain: session.user.domain,
          onboardingData: session.user.onboardingData,
        }
      }
    });
  } catch (error) {
    console.error("Session refresh error:", error);
    return NextResponse.json(
      { error: "Failed to refresh session" },
      { status: 500 }
    );
  }
}
