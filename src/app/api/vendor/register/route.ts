import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { z } from "zod";

const vendorSchema = z.object({
  storeName: z.string().min(3).max(100),
  description: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  gstNumber: z.string().optional(),
  panNumber: z.string().optional(),
  bankName: z.string().optional(),
  bankAccount: z.string().optional(),
  bankIfsc: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is already a vendor
    const existingVendor = await db.vendor.findUnique({
      where: { userId: session.user.id },
    });

    if (existingVendor) {
      return NextResponse.json(
        { error: "You are already registered as a vendor" },
        { status: 409 }
      );
    }

    const body = await req.json();
    const parsed = vendorSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Generate unique slug
    let slug = slugify(data.storeName);
    const existingSlug = await db.vendor.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const vendor = await db.vendor.create({
      data: {
        userId: session.user.id,
        storeName: data.storeName,
        slug,
        description: data.description,
        phone: data.phone,
        email: data.email || session.user.email!,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        gstNumber: data.gstNumber,
        panNumber: data.panNumber,
        bankName: data.bankName,
        bankAccount: data.bankAccount,
        bankIfsc: data.bankIfsc,
        status: "PENDING",
      },
    });

    // Update user role to VENDOR
    await db.user.update({
      where: { id: session.user.id },
      data: { role: "VENDOR" },
    });

    // Notify admin
    const admins = await db.user.findMany({
      where: { role: "ADMIN" },
    });

    for (const admin of admins) {
      await db.notification.create({
        data: {
          userId: admin.id,
          type: "SYSTEM",
          title: "New Vendor Registration",
          message: `${data.storeName} has registered as a vendor and needs approval.`,
          link: "/admin/vendors",
        },
      });
    }

    return NextResponse.json(
      { message: "Vendor registration submitted for approval", vendor },
      { status: 201 }
    );
  } catch (error) {
    console.error("Vendor registration error:", error);
    return NextResponse.json(
      { error: "Failed to register vendor" },
      { status: 500 }
    );
  }
}
