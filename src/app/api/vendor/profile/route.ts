import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const vendor = await db.vendor.findUnique({
      where: { userId: session.user.id },
      include: {
        _count: { select: { products: true, orders: true } },
      },
    });

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    return NextResponse.json({ vendor });
  } catch (error) {
    console.error("Vendor profile error:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const vendor = await db.vendor.findUnique({
      where: { userId: session.user.id },
    });

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    const body = await req.json();
    const allowedFields = [
      "storeName", "description", "logo", "banner", "phone", "email",
      "address", "city", "state", "pincode",
    ];

    const updateData: any = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const updated = await db.vendor.update({
      where: { id: vendor.id },
      data: updateData,
    });

    return NextResponse.json({ vendor: updated });
  } catch (error) {
    console.error("Vendor update error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
