import { createClient, type RedisClientType } from "redis";

let redisClient: RedisClientType | null = null;
let connectionFailed = false;

async function getRedis(): Promise<RedisClientType | null> {
  // Don't attempt during build or if previously failed
  if (connectionFailed) return null;
  if (process.env.NEXT_PHASE === "phase-production-build") return null;
  if (!process.env.REDIS_URL && process.env.NODE_ENV === "production") return null;

  if (redisClient?.isOpen) return redisClient;

  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
      socket: {
        connectTimeout: 2000,
        reconnectStrategy: false, // Never auto-reconnect
      },
    });

    redisClient.on("error", () => {
      connectionFailed = true;
    });

    await redisClient.connect();
    return redisClient;
  } catch {
    connectionFailed = true;
    redisClient = null;
    return null;
  }
}

export { getRedis };

// Cache helpers with graceful degradation
export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const client = await getRedis();
    if (!client) return null;
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export async function setCache(key: string, data: unknown, ttlSeconds: number = 300): Promise<void> {
  try {
    const client = await getRedis();
    if (!client) return;
    await client.setEx(key, ttlSeconds, JSON.stringify(data));
  } catch {
    // Cache write failure is non-critical
  }
}

export async function invalidateCache(pattern: string): Promise<void> {
  try {
    const client = await getRedis();
    if (!client) return;
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
    }
  } catch {
    // Cache invalidation failure is non-critical
  }
}
