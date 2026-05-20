import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateToken } from "@/lib/security";
import { sendVerificationEmail } from "@/lib/email";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

// POST /api/auth/verify-email - Send verification email
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (!rateLimit(`verify-email:${ip}`, 3, 300000)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const user = await db.user.findUnique({ where: { id: session.user.id } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ message: "Email already verified" });
    }

    // Delete existing tokens
    await db.emailVerificationToken.deleteMany({ where: { email: user.email } });

    // Create new token (expires in 24 hours)
    const token = generateToken();
    await db.emailVerificationToken.create({
      data: {
        email: user.email,
        token,
        expires: new Date(Date.now() + 86400000),
      },
    });

    await sendVerificationEmail(user.email, token);

    return NextResponse.json({ message: "Verification email sent" });
  } catch (error) {
    console.error("Send verification error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// PUT /api/auth/verify-email - Verify with token
export async function PUT(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const verificationToken = await db.emailVerificationToken.findUnique({ where: { token } });

    if (!verificationToken || verificationToken.expires < new Date()) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    await db.user.update({
      where: { email: verificationToken.email },
      data: { emailVerified: new Date() },
    });

    await db.emailVerificationToken.delete({ where: { id: verificationToken.id } });

    return NextResponse.json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
