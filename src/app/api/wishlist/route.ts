import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const wishlist = await db.wishlist.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          include: {
            vendor: { select: { id: true, storeName: true, slug: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ wishlist });
  } catch (error) {
    console.error("Wishlist fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch wishlist" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await req.json();

    const existing = await db.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
    });

    if (existing) {
      await db.wishlist.delete({ where: { id: existing.id } });
      return NextResponse.json({ message: "Removed from wishlist", added: false });
    }

    await db.wishlist.create({
      data: {
        userId: session.user.id,
        productId,
      },
    });

    return NextResponse.json({ message: "Added to wishlist", added: true });
  } catch (error) {
    console.error("Wishlist error:", error);
    return NextResponse.json({ error: "Failed to update wishlist" }, { status: 500 });
  }
}
