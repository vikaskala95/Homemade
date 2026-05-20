import { cn, formatPrice, slugify, generateOrderNumber, truncate, getInitials, timeAgo, sanitize } from "@/lib/utils";

describe("Utility Functions", () => {
  describe("cn", () => {
    it("merges class names", () => {
      expect(cn("px-4", "py-2")).toBe("px-4 py-2");
    });

    it("handles conditional classes", () => {
      expect(cn("px-4", false && "py-2", "mt-1")).toBe("px-4 mt-1");
    });
  });

  describe("formatPrice", () => {
    it("formats price in INR", () => {
      const result = formatPrice(1000);
      expect(result).toContain("1,000");
    });

    it("handles zero", () => {
      const result = formatPrice(0);
      expect(result).toContain("0");
    });

    it("handles decimals", () => {
      const result = formatPrice(99.5);
      expect(result).toContain("99");
    });
  });

  describe("slugify", () => {
    it("converts text to slug", () => {
      expect(slugify("Hello World")).toBe("hello-world");
    });

    it("handles special characters", () => {
      expect(slugify("Organic Honey (Pure)")).toBe("organic-honey-pure");
    });

    it("removes multiple hyphens", () => {
      expect(slugify("hello---world")).toBe("hello-world");
    });

    it("trims hyphens", () => {
      expect(slugify("-hello-world-")).toBe("hello-world");
    });
  });

  describe("generateOrderNumber", () => {
    it("starts with HM-", () => {
      expect(generateOrderNumber()).toMatch(/^HM-/);
    });

    it("generates unique values", () => {
      const a = generateOrderNumber();
      const b = generateOrderNumber();
      expect(a).not.toBe(b);
    });
  });

  describe("truncate", () => {
    it("truncates long text", () => {
      expect(truncate("Hello World Testing", 10)).toBe("Hello W...");
    });

    it("returns original if short", () => {
      expect(truncate("Hi", 10)).toBe("Hi");
    });
  });

  describe("getInitials", () => {
    it("gets initials from full name", () => {
      expect(getInitials("John Doe")).toBe("JD");
    });

    it("handles single name", () => {
      expect(getInitials("John")).toBe("J");
    });

    it("handles empty string", () => {
      expect(getInitials("")).toBe("");
    });
  });

  describe("timeAgo", () => {
    it("returns relative time", () => {
      const now = new Date();
      expect(timeAgo(now.toISOString())).toMatch(/just now|seconds? ago/i);
    });

    it("handles older dates", () => {
      const old = new Date(Date.now() - 3600 * 1000);
      expect(timeAgo(old.toISOString())).toMatch(/hour/i);
    });
  });

  describe("sanitize", () => {
    it("strips HTML tags", () => {
      expect(sanitize("<script>alert('xss')</script>hello")).toBe("scriptalert(xss)/scripthello");
    });

    it("removes dangerous characters", () => {
      expect(sanitize('test"value')).toBe("testvalue");
    });

    it("trims whitespace", () => {
      expect(sanitize("  hello  ")).toBe("hello");
    });

    it("handles clean input unchanged", () => {
      expect(sanitize("Hello World")).toBe("Hello World");
    });
  });
});
