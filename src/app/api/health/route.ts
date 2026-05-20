import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/health - Application health check
export async function GET() {
  const checks: Record<string, { status: string; latency?: number; error?: string }> = {};

  // Database check
  const dbStart = Date.now();
  try {
    await db.$queryRaw`SELECT 1`;
    checks.database = { status: "healthy", latency: Date.now() - dbStart };
  } catch (error: any) {
    checks.database = { status: "unhealthy", error: error.message, latency: Date.now() - dbStart };
  }

  // Redis check
  const redisStart = Date.now();
  try {
    const { getRedis } = await import("@/lib/redis");
    const client = await getRedis();
    if (client) {
      await client.ping();
      checks.redis = { status: "healthy", latency: Date.now() - redisStart };
    } else {
      checks.redis = { status: "degraded", error: "Not connected" };
    }
  } catch (error: any) {
    checks.redis = { status: "unhealthy", error: error.message, latency: Date.now() - redisStart };
  }

  const isHealthy = checks.database.status === "healthy";

  return NextResponse.json(
    {
      status: isHealthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || "1.0.0",
      checks,
    },
    { status: isHealthy ? 200 : 503 }
  );
}
