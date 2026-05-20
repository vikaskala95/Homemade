import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

async function isAdmin() {
  const session = await auth();
  if (!session?.user?.id) return false;
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  return user?.role === "ADMIN";
}

export async function GET(req: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where: any = {};
    if (status) where.status = status;

    const vendors = await db.vendor.findMany({
      where,
      include: {
        user: { select: { name: true, email: true, image: true } },
        _count: { select: { products: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ vendors });
  } catch (error) {
    console.error("Admin vendors error:", error);
    return NextResponse.json({ error: "Failed to fetch vendors" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { vendorId, status } = await req.json();

    if (!vendorId || !["APPROVED", "REJECTED", "SUSPENDED"].includes(status)) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const vendor = await db.vendor.update({
      where: { id: vendorId },
      data: { status },
    });

    // Notify vendor
    await db.notification.create({
      data: {
        userId: vendor.userId,
        type: "SYSTEM",
        title: `Vendor ${status.toLowerCase()}`,
        message: `Your vendor application has been ${status.toLowerCase()}.`,
        link: "/vendor/dashboard",
      },
    });

    return NextResponse.json({ message: "Vendor status updated", vendor });
  } catch (error) {
    console.error("Admin vendor update error:", error);
    return NextResponse.json({ error: "Failed to update vendor" }, { status: 500 });
  }
}
