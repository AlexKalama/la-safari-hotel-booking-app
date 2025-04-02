import { getUserById } from "@/lib/users";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "User ID required" }, { status: 400 });
  }

  try {
    const user = await getUserById(userId);
    if (!user) {
      // If the user doesn't exist in our database, default to 'user' role
      return NextResponse.json({ role: "user" });
    }

    return NextResponse.json({ role: user.role });
  } catch (error) {
    console.error("Error fetching user role:", error);
    return NextResponse.json({ error: "Failed to fetch user role" }, { status: 500 });
  }
}
