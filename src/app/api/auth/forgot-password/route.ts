import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateToken } from "@/lib/security";
import { sendPasswordResetEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";

// POST /api/auth/forgot-password
export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (!rateLimit(`forgot-password:${ip}`, 3, 300000)) {
      return NextResponse.json({ error: "Too many requests. Try again in 5 minutes." }, { status: 429 });
    }

    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email: email.toLowerCase().trim() } });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ message: "If an account exists, a reset link has been sent." });
    }

    // Delete existing tokens for this email
    await db.passwordResetToken.deleteMany({ where: { email: user.email } });

    // Create new token (expires in 1 hour)
    const token = generateToken();
    await db.passwordResetToken.create({
      data: {
        email: user.email,
        token,
        expires: new Date(Date.now() + 3600000),
      },
    });

    await sendPasswordResetEmail(user.email, token);

    return NextResponse.json({ message: "If an account exists, a reset link has been sent." });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
