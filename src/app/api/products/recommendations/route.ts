import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getCached, setCache } from "@/lib/redis";

// GET /api/products/recommendations
export async function GET(req: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "trending"; // trending, similar, personalized, new-arrivals
    const productId = searchParams.get("productId");
    const limit = Math.min(parseInt(searchParams.get("limit") || "12"), 50);

    const cacheKey = `recommendations:${type}:${session?.user?.id || "anon"}:${productId || "all"}`;
    const cached = await getCached<any>(cacheKey);
    if (cached) return NextResponse.json(cached);

    let products: any[] = [];

    switch (type) {
      case "trending": {
        // Products with highest sales + views in last 30 days
        products = await db.product.findMany({
          where: { status: "ACTIVE" },
          include: {
            vendor: { select: { id: true, storeName: true, slug: true } },
            category: { select: { id: true, name: true, slug: true } },
          },
          orderBy: [{ soldCount: "desc" }, { viewCount: "desc" }, { rating: "desc" }],
          take: limit,
        });
        break;
      }

      case "similar": {
        if (!productId) {
          return NextResponse.json({ error: "productId required for similar" }, { status: 400 });
        }
        const product = await db.product.findUnique({
          where: { id: productId },
          select: { categoryId: true, tags: true, price: true, vendorId: true },
        });
        if (!product) {
          return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        // Find products in same category, similar price range, or matching tags
        products = await db.product.findMany({
          where: {
            status: "ACTIVE",
            id: { not: productId },
            OR: [
              { categoryId: product.categoryId },
              { tags: { hasSome: product.tags } },
              {
                price: {
                  gte: product.price * 0.5,
                  lte: product.price * 1.5,
                },
              },
            ],
          },
          include: {
            vendor: { select: { id: true, storeName: true, slug: true } },
            category: { select: { id: true, name: true, slug: true } },
          },
          orderBy: [{ rating: "desc" }, { soldCount: "desc" }],
          take: limit,
        });
        break;
      }

      case "personalized": {
        if (!session?.user?.id) {
          // Fall back to trending for non-logged-in users
          products = await db.product.findMany({
            where: { status: "ACTIVE" },
            include: {
              vendor: { select: { id: true, storeName: true, slug: true } },
              category: { select: { id: true, name: true, slug: true } },
            },
            orderBy: [{ soldCount: "desc" }, { rating: "desc" }],
            take: limit,
          });
          break;
        }

        // Get user's purchase history and wishlist for preferences
        const [orderItems, wishlistItems, viewedCategories] = await Promise.all([
          db.orderItem.findMany({
            where: { order: { userId: session.user.id } },
            select: { product: { select: { categoryId: true, tags: true, vendorId: true } } },
            take: 50,
          }),
          db.wishlist.findMany({
            where: { userId: session.user.id },
            select: { product: { select: { categoryId: true, tags: true } } },
            take: 50,
          }),
          db.productView.findMany({
            where: { userId: session.user.id },
            select: { productId: true },
            orderBy: { createdAt: "desc" },
            take: 20,
          }),
        ]);

        // Extract preferred categories and tags
        const categoryIds = new Set<string>();
        const tags = new Set<string>();
        const vendorIds = new Set<string>();

        [...orderItems, ...wishlistItems].forEach((item) => {
          if (item.product.categoryId) categoryIds.add(item.product.categoryId);
          item.product.tags?.forEach((tag: string) => tags.add(tag));
          if ("vendorId" in item.product && item.product.vendorId) vendorIds.add(item.product.vendorId as string);
        });

        const viewedProductIds = viewedCategories.map((v) => v.productId);

        if (categoryIds.size === 0 && tags.size === 0) {
          // New user - show popular products
          products = await db.product.findMany({
            where: { status: "ACTIVE" },
            include: {
              vendor: { select: { id: true, storeName: true, slug: true } },
              category: { select: { id: true, name: true, slug: true } },
            },
            orderBy: [{ soldCount: "desc" }, { rating: "desc" }],
            take: limit,
          });
        } else {
          products = await db.product.findMany({
            where: {
              status: "ACTIVE",
              id: { notIn: viewedProductIds },
              OR: [
                { categoryId: { in: Array.from(categoryIds) } },
                { tags: { hasSome: Array.from(tags) } },
                { vendorId: { in: Array.from(vendorIds) } },
              ],
            },
            include: {
              vendor: { select: { id: true, storeName: true, slug: true } },
              category: { select: { id: true, name: true, slug: true } },
            },
            orderBy: [{ rating: "desc" }, { soldCount: "desc" }],
            take: limit,
          });
        }
        break;
      }

      case "new-arrivals": {
        products = await db.product.findMany({
          where: { status: "ACTIVE" },
          include: {
            vendor: { select: { id: true, storeName: true, slug: true } },
            category: { select: { id: true, name: true, slug: true } },
          },
          orderBy: { createdAt: "desc" },
          take: limit,
        });
        break;
      }

      default:
        return NextResponse.json({ error: "Invalid recommendation type" }, { status: 400 });
    }

    const result = { products, type };
    await setCache(cacheKey, result, type === "personalized" ? 300 : 600);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Recommendations error:", error);
    return NextResponse.json({ error: "Failed to get recommendations" }, { status: 500 });
  }
}
