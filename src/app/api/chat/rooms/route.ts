import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rooms = await db.chatRoom.findMany({
      where: {
        members: { some: { userId: session.user.id } },
      },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, image: true } },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { content: true, createdAt: true, senderId: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Add a display name for each room
    const roomsWithNames = rooms.map((room) => ({
      ...room,
      name: room.members
        .filter((m) => m.userId !== session!.user!.id)
        .map((m) => m.user.name)
        .join(", ") || "Chat",
    }));

    return NextResponse.json({ rooms: roomsWithNames });
  } catch (error) {
    console.error("Chat rooms error:", error);
    return NextResponse.json({ error: "Failed to fetch rooms" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { recipientId } = await req.json();
    if (!recipientId) {
      return NextResponse.json({ error: "Recipient required" }, { status: 400 });
    }

    // Check if a 1:1 room already exists
    const existingRoom = await db.chatRoom.findFirst({
      where: {
        AND: [
          { members: { some: { userId: session.user.id } } },
          { members: { some: { userId: recipientId } } },
        ],
      },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, image: true } } },
        },
      },
    });

    if (existingRoom) {
      return NextResponse.json({ room: existingRoom });
    }

    const room = await db.chatRoom.create({
      data: {
        members: {
          create: [
            { userId: session.user.id },
            { userId: recipientId },
          ],
        },
      },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, image: true } } },
        },
      },
    });

    return NextResponse.json({ room }, { status: 201 });
  } catch (error) {
    console.error("Chat room creation error:", error);
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 });
  }
}
