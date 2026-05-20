import { rateLimit } from "@/lib/rate-limit";

describe("Rate Limiter", () => {
  it("allows requests within limit", () => {
    const key = `test-${Date.now()}-1`;
    expect(rateLimit(key, 5, 60000)).toBe(true);
    expect(rateLimit(key, 5, 60000)).toBe(true);
    expect(rateLimit(key, 5, 60000)).toBe(true);
  });

  it("blocks after exceeding limit", () => {
    const key = `test-${Date.now()}-2`;
    for (let i = 0; i < 3; i++) rateLimit(key, 3, 60000);
    expect(rateLimit(key, 3, 60000)).toBe(false);
  });

  it("allows requests from different keys", () => {
    const key1 = `test-${Date.now()}-3a`;
    const key2 = `test-${Date.now()}-3b`;
    for (let i = 0; i < 5; i++) rateLimit(key1, 5, 60000);
    expect(rateLimit(key1, 5, 60000)).toBe(false);
    expect(rateLimit(key2, 5, 60000)).toBe(true);
  });
});
