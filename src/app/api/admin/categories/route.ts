import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";

async function isAdmin() {
  const session = await auth();
  if (!session?.user?.id) return false;
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  return user?.role === "ADMIN";
}

export async function GET() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const categories = await db.category.findMany({
      include: {
        _count: { select: { products: true } },
        children: {
          include: { _count: { select: { products: true } } },
        },
      },
      where: { parentId: null },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Categories error:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { name, slug, description, image, parentId, sortOrder } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Name required" }, { status: 400 });
    }

    const finalSlug = slug || slugify(name);

    const category = await db.category.create({
      data: {
        name,
        slug: finalSlug,
        description,
        image,
        parentId,
        sortOrder: sortOrder || 0,
      },
    });

    return NextResponse.json({ message: "Category created", category }, { status: 201 });
  } catch (error) {
    console.error("Category creation error:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Category ID required" }, { status: 400 });
    }

    await db.category.delete({ where: { id } });

    return NextResponse.json({ message: "Category deleted" });
  } catch (error) {
    console.error("Category delete error:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
