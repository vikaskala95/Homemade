import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(3).max(200),
  description: z.string().min(10),
  shortDesc: z.string().optional(),
  categoryId: z.string(),
  price: z.number().positive(),
  comparePrice: z.number().positive().optional(),
  costPrice: z.number().positive().optional(),
  stock: z.number().int().min(0),
  minOrder: z.number().int().min(1).default(1),
  maxOrder: z.number().int().optional(),
  weight: z.number().optional(),
  unit: z.string().optional(),
  images: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  isOrganic: z.boolean().default(false),
  metaTitle: z.string().optional(),
  metaDesc: z.string().optional(),
});

export async function GET(req: Request) {
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

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");

    const where: any = { vendorId: vendor.id };
    if (status) where.status = status;

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Vendor products error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const vendor = await db.vendor.findUnique({
      where: { userId: session.user.id },
    });

    if (!vendor || vendor.status !== "APPROVED") {
      return NextResponse.json(
        { error: "Vendor account not approved" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = productSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Generate unique slug
    let slug = slugify(data.name);
    const existing = await db.product.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const product = await db.product.create({
      data: {
        vendorId: vendor.id,
        categoryId: data.categoryId,
        name: data.name,
        slug,
        description: data.description,
        shortDesc: data.shortDesc,
        price: data.price,
        comparePrice: data.comparePrice,
        costPrice: data.costPrice,
        stock: data.stock,
        minOrder: data.minOrder,
        maxOrder: data.maxOrder,
        weight: data.weight,
        unit: data.unit,
        images: data.images,
        tags: data.tags.map((t) => t.toLowerCase()),
        isOrganic: data.isOrganic,
        metaTitle: data.metaTitle,
        metaDesc: data.metaDesc,
        status: "PENDING_APPROVAL",
      },
    });

    return NextResponse.json(
      { message: "Product created and submitted for approval", product },
      { status: 201 }
    );
  } catch (error) {
    console.error("Product creation error:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const vendor = await db.vendor.findUnique({ where: { userId: session.user.id } });
    if (!vendor || vendor.status !== "APPROVED") {
      return NextResponse.json({ error: "Vendor not approved" }, { status: 403 });
    }

    const body = await req.json();
    const { productId, ...rest } = body;

    if (!productId) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    const existing = await db.product.findFirst({
      where: { id: productId, vendorId: vendor.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const parsed = productSchema.safeParse(rest);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    const data = parsed.data;
    const product = await db.product.update({
      where: { id: productId },
      data: {
        categoryId: data.categoryId,
        name: data.name,
        description: data.description,
        shortDesc: data.shortDesc,
        price: data.price,
        comparePrice: data.comparePrice,
        costPrice: data.costPrice,
        stock: data.stock,
        minOrder: data.minOrder,
        maxOrder: data.maxOrder,
        weight: data.weight,
        unit: data.unit,
        images: data.images,
        tags: data.tags.map((t) => t.toLowerCase()),
        isOrganic: data.isOrganic,
        metaTitle: data.metaTitle,
        metaDesc: data.metaDesc,
      },
    });

    return NextResponse.json({ message: "Product updated", product });
  } catch (error) {
    console.error("Product update error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const vendor = await db.vendor.findUnique({ where: { userId: session.user.id } });
    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("id");
    if (!productId) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    const product = await db.product.findFirst({
      where: { id: productId, vendorId: vendor.id },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await db.product.delete({ where: { id: productId } });

    return NextResponse.json({ message: "Product deleted" });
  } catch (error) {
    console.error("Product delete error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
