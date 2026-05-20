import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

const otpStore = new Map<string, { otp: string; expires: number }>();

// POST /api/auth/send-otp - Send OTP to phone
export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const allowed = rateLimit(`otp:${ip}`, 3, 300000);
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
    }

    const { phone } = await req.json();
    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      return NextResponse.json({ error: "Invalid Indian phone number" }, { status: 400 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(phone, { otp, expires: Date.now() + 5 * 60 * 1000 }); // 5 min expiry

    // In production, send OTP via SMS provider (Twilio, MSG91, etc.)
    if (process.env.NODE_ENV === "development") {
      console.log(`[DEV] OTP for ${phone}: ${otp}`);
    } else {
      // TODO: Integrate SMS provider
      // await sendSMS(phone, `Your Homemade Everything OTP is: ${otp}`);
    }

    return NextResponse.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}

// PUT /api/auth/send-otp - Verify OTP and login/register
export async function PUT(req: Request) {
  try {
    const { phone, otp } = await req.json();
    if (!phone || !otp) {
      return NextResponse.json({ error: "Phone and OTP required" }, { status: 400 });
    }

    const stored = otpStore.get(phone);
    if (!stored || stored.otp !== otp) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    if (Date.now() > stored.expires) {
      otpStore.delete(phone);
      return NextResponse.json({ error: "OTP expired" }, { status: 400 });
    }

    otpStore.delete(phone);

    // Find or create user by phone
    let user = await db.user.findUnique({ where: { phone } });
    if (!user) {
      user = await db.user.create({
        data: {
          phone,
          name: `User ${phone.slice(-4)}`,
          email: `${phone}@phone.homemade.local`, // placeholder
          role: "CUSTOMER",
        },
      });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
      verified: true,
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
