import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

async function isAdmin() {
  const session = await auth();
  if (!session?.user?.id) return false;
  const user = await db.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  return user?.role === "ADMIN";
}

export async function GET() {
  try {
    if (!(await isAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const banners = await db.banner.findMany({ orderBy: { sortOrder: "asc" } });
    return NextResponse.json({ banners });
  } catch {
    return NextResponse.json({ error: "Failed to fetch banners" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!(await isAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { title, image, link, sortOrder } = await req.json();
    if (!title || !image) return NextResponse.json({ error: "Title and image required" }, { status: 400 });
    const banner = await db.banner.create({ data: { title, image, link, sortOrder: sortOrder || 0 } });
    return NextResponse.json({ banner }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create banner" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    if (!(await isAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { id, ...data } = await req.json();
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    const banner = await db.banner.update({ where: { id }, data });
    return NextResponse.json({ banner });
  } catch {
    return NextResponse.json({ error: "Failed to update banner" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    if (!(await isAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    await db.banner.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete banner" }, { status: 500 });
  }
}
