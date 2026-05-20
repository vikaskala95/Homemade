import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: { roomId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user is member of room
    const member = await db.chatRoomMember.findFirst({
      where: { chatRoomId: params.roomId, userId: session.user.id },
    });

    if (!member) {
      return NextResponse.json({ error: "Not a member" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");
    const limit = parseInt(searchParams.get("limit") || "50");

    const messages = await db.chatMessage.findMany({
      where: { chatRoomId: params.roomId },
      include: {
        sender: { select: { id: true, name: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    return NextResponse.json({ messages: messages.reverse() });
  } catch (error) {
    console.error("Messages error:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { roomId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const member = await db.chatRoomMember.findFirst({
      where: { chatRoomId: params.roomId, userId: session.user.id },
    });

    if (!member) {
      return NextResponse.json({ error: "Not a member" }, { status: 403 });
    }

    const { content, image } = await req.json();
    if ((!content || content.trim().length === 0) && !image) {
      return NextResponse.json({ error: "Message or image required" }, { status: 400 });
    }

    const message = await db.chatMessage.create({
      data: {
        chatRoomId: params.roomId,
        senderId: session.user.id,
        content: content?.trim() || "",
        ...(image ? { image } : {}),
      },
      include: {
        sender: { select: { id: true, name: true, image: true } },
      },
    });

    // Update room's updatedAt
    await db.chatRoom.update({
      where: { id: params.roomId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
