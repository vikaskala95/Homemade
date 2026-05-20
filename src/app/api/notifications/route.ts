import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notifications = await db.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const unreadCount = await db.notification.count({
      where: { userId: session.user.id, isRead: false },
    });

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    console.error("Notifications error:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { notificationId } = await req.json();

    if (notificationId) {
      await db.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
      });
    } else {
      await db.notification.updateMany({
        where: { userId: session.user.id, isRead: false },
        data: { isRead: true },
      });
    }

    return NextResponse.json({ message: "Notifications updated" });
  } catch (error) {
    console.error("Notifications update error:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
