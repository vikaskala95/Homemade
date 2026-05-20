import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const role = searchParams.get("role");
    const search = searchParams.get("search");

    const where: any = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id: true, name: true, email: true, role: true, image: true,
          emailVerified: true, createdAt: true,
          _count: { select: { orders: true, reviews: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.user.count({ where }),
    ]);

    return NextResponse.json({ users, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error("Admin users error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, role } = await req.json();
    if (!userId || !role) {
      return NextResponse.json({ error: "User ID and role required" }, { status: 400 });
    }

    const validRoles = ["CUSTOMER", "VENDOR", "ADMIN"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    if (userId === session.user.id) {
      return NextResponse.json({ error: "Cannot change your own role" }, { status: 400 });
    }

    const user = await db.user.update({
      where: { id: userId },
      data: { role },
    });

    return NextResponse.json({ message: "User role updated", user });
  } catch (error) {
    console.error("Admin user update error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
