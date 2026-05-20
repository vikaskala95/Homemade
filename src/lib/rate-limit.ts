const rateMap = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now();
  const entry = rateMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) {
    return false;
  }

  entry.count++;
  return true;
}

// Cleanup stale entries periodically
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateMap.entries()) {
      if (now > entry.resetAt) {
        rateMap.delete(key);
      }
    }
  }, 60000);
}
