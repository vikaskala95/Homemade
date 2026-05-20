import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { rateLimit } from "@/lib/rate-limit";

// POST /api/auth/reset-password
export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (!rateLimit(`reset-password:${ip}`, 5, 300000)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const resetToken = await db.passwordResetToken.findUnique({ where: { token } });

    if (!resetToken || resetToken.expires < new Date()) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.user.update({
      where: { email: resetToken.email },
      data: { password: hashedPassword },
    });

    // Delete used token
    await db.passwordResetToken.delete({ where: { id: resetToken.id } });

    return NextResponse.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
