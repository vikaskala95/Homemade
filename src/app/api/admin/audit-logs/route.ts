import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/admin/audit-logs - List audit logs
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 50;
    const action = searchParams.get("action");
    const entity = searchParams.get("entity");

    const where: any = {};
    if (action) where.action = { contains: action, mode: "insensitive" };
    if (entity) where.entity = entity;

    const [logs, total] = await Promise.all([
      db.auditLog.findMany({
        where,
        include: {
          user: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.auditLog.count({ where }),
    ]);

    return NextResponse.json({
      logs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Audit logs error:", error);
    return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 });
  }
}
