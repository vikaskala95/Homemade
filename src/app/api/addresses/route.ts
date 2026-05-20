import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const addressSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(10),
  address: z.string().min(5),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().min(6),
  isDefault: z.boolean().optional(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const addresses = await db.address.findMany({
      where: { userId: session.user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ addresses });
  } catch (error) {
    console.error("Addresses error:", error);
    return NextResponse.json({ error: "Failed to fetch addresses" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = addressSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const data = parsed.data;

    if (data.isDefault) {
      await db.address.updateMany({
        where: { userId: session.user.id },
        data: { isDefault: false },
      });
    }

    const address = await db.address.create({
      data: {
        userId: session.user.id,
        ...data,
        isDefault: data.isDefault || false,
      },
    });

    return NextResponse.json({ address }, { status: 201 });
  } catch (error) {
    console.error("Address creation error:", error);
    return NextResponse.json({ error: "Failed to create address" }, { status: 500 });
  }
}
