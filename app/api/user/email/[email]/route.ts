import { NextRequest } from "next/server";
import { UserController } from "@/lib/controllers/userController";

export async function GET(
  request: NextRequest,
  { params }: { params: { email: string } }
) {
  // Decode the email from the URL parameter
  const email = decodeURIComponent(params.email);
  return UserController.getUserProfileByEmail(email);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { email: string } }
) {
  // Decode the email from the URL parameter
  const email = decodeURIComponent(params.email);
  return UserController.updateOnboardingByEmail(request);
}
