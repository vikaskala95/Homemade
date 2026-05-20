import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCached, setCache } from "@/lib/redis";

export async function GET() {
  try {
    const cached = await getCached<any>("categories:all");
    if (cached) return NextResponse.json(cached);

    const categories = await db.category.findMany({
      where: { isActive: true, parentId: null },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
        _count: { select: { products: true } },
      },
      orderBy: { sortOrder: "asc" },
    });

    const result = { categories };
    await setCache("categories:all", result, 300); // 5 min cache
    return NextResponse.json(result);
  } catch (error) {
    console.error("Categories error:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}
