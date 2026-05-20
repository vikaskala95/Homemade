import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCached, setCache } from "@/lib/redis";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sort = searchParams.get("sort") || "newest";
    const featured = searchParams.get("featured");
    const organic = searchParams.get("organic");
    const vendorId = searchParams.get("vendorId");

    const where: any = {
      status: "ACTIVE",
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { hasSome: [search.toLowerCase()] } },
      ];
    }

    if (category) {
      where.category = { slug: category };
    }

    if (minPrice) where.price = { ...where.price, gte: parseFloat(minPrice) };
    if (maxPrice) where.price = { ...where.price, lte: parseFloat(maxPrice) };
    if (featured === "true") where.isFeatured = true;
    if (organic === "true") where.isOrganic = true;
    if (vendorId) where.vendorId = vendorId;

    const orderBy: any = {};
    switch (sort) {
      case "price-low":
        orderBy.price = "asc";
        break;
      case "price-high":
        orderBy.price = "desc";
        break;
      case "popular":
        orderBy.soldCount = "desc";
        break;
      case "rating":
        orderBy.rating = "desc";
        break;
      default:
        orderBy.createdAt = "desc";
    }

    // Cache key based on all query params
    const cacheKey = `products:${page}:${limit}:${search}:${category}:${minPrice}:${maxPrice}:${sort}:${featured}:${organic}:${vendorId}`;
    const cached = await getCached<any>(cacheKey);
    if (cached) return NextResponse.json(cached);

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          vendor: { select: { id: true, storeName: true, slug: true } },
          category: { select: { id: true, name: true, slug: true } },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.product.count({ where }),
    ]);

    const result = {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    await setCache(cacheKey, result, 60); // Cache for 60 seconds
    return NextResponse.json(result);
  } catch (error) {
    console.error("Products fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
