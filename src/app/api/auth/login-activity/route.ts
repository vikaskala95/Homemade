import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/auth/login-activity - Get login history
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const activities = await db.loginActivity.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        ip: true,
        device: true,
        location: true,
        success: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ activities });
  } catch (error) {
    console.error("Login activity error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
