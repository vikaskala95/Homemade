import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { registerSchema } from "@/lib/validations/auth";
import { generateToken } from "@/lib/security";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (!rateLimit(`register:${ip}`, 5, 300000)) {
      return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
    }

    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Invalid input";
      return NextResponse.json(
        { error: firstError, details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, phone, password, role } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    if (phone) {
      const existingPhone = await db.user.findUnique({
        where: { phone },
      });
      if (existingPhone) {
        return NextResponse.json(
          { error: "Phone number already registered" },
          { status: 409 }
        );
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await db.user.create({
      data: {
        name,
        email: normalizedEmail,
        phone: phone || null,
        password: hashedPassword,
        role: role || "CUSTOMER",
      },
    });

    // Create empty cart for user
    await db.cart.create({
      data: { userId: user.id },
    });

    // Send verification email
    const token = generateToken();
    await db.emailVerificationToken.create({
      data: {
        email: normalizedEmail,
        token,
        expires: new Date(Date.now() + 86400000), // 24 hours
      },
    });
    await sendVerificationEmail(normalizedEmail, token);

    return NextResponse.json(
      { message: "Account created successfully", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
