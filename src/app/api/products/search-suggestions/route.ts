import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCached, setCache } from "@/lib/redis";

// GET /api/products/search-suggestions?q=...
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const limit = Math.min(parseInt(searchParams.get("limit") || "8"), 20);

    if (query.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    const cacheKey = `search-suggestions:${query.toLowerCase()}`;
    const cached = await getCached<any>(cacheKey);
    if (cached) return NextResponse.json(cached);

    const [products, categories] = await Promise.all([
      db.product.findMany({
        where: {
          status: "ACTIVE",
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { tags: { hasSome: [query.toLowerCase()] } },
          ],
        },
        select: { name: true, slug: true, images: true, price: true },
        take: limit,
      }),
      db.category.findMany({
        where: {
          isActive: true,
          name: { contains: query, mode: "insensitive" },
        },
        select: { name: true, slug: true },
        take: 3,
      }),
    ]);

    // Log search query for analytics
    db.searchQuery.create({
      data: { query: query.toLowerCase(), results: products.length },
    }).catch(() => {}); // Fire and forget

    const result = { suggestions: { products, categories } };
    await setCache(cacheKey, result, 120);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Search suggestions error:", error);
    return NextResponse.json({ suggestions: [] });
  }
}
