import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.user.findUnique({ where: { id: session.user.id } });
    if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { title, message, target } = await req.json();
    if (!title || !message) return NextResponse.json({ error: "Title and message required" }, { status: 400 });

    // Find target users
    const whereClause = target === "VENDORS"
      ? { role: "VENDOR" as const }
      : target === "CUSTOMERS"
        ? { role: "CUSTOMER" as const }
        : {};

    const users = await db.user.findMany({
      where: whereClause,
      select: { id: true },
    });

    // Create notifications for all target users
    await db.notification.createMany({
      data: users.map((u) => ({
        userId: u.id,
        type: "SYSTEM" as const,
        title,
        message,
        isRead: false,
      })),
    });

    return NextResponse.json({ count: users.length });
  } catch (error) {
    console.error("Admin notification error:", error);
    return NextResponse.json({ error: "Failed to send notifications" }, { status: 500 });
  }
}
