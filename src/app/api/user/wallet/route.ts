import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/user/wallet - Get wallet balance and transactions
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let wallet = await db.wallet.findUnique({
      where: { userId: session.user.id },
      include: {
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    // Auto-create wallet if not exists
    if (!wallet) {
      wallet = await db.wallet.create({
        data: { userId: session.user.id },
        include: { transactions: true },
      });
    }

    return NextResponse.json({ wallet });
  } catch (error) {
    console.error("Wallet error:", error);
    return NextResponse.json({ error: "Failed to fetch wallet" }, { status: 500 });
  }
}
