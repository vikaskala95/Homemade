import { generateToken, hashToken, sanitizeInput, sanitizeEmail, generateCsrfToken, verifyCsrfToken, maskSensitive } from "@/lib/security";

describe("Security Utilities", () => {
  describe("generateToken", () => {
    it("generates 64-char hex string", () => {
      const token = generateToken();
      expect(token).toHaveLength(64);
      expect(token).toMatch(/^[a-f0-9]+$/);
    });

    it("generates unique tokens", () => {
      const t1 = generateToken();
      const t2 = generateToken();
      expect(t1).not.toBe(t2);
    });
  });

  describe("hashToken", () => {
    it("creates deterministic hash", () => {
      const hash1 = hashToken("test");
      const hash2 = hashToken("test");
      expect(hash1).toBe(hash2);
    });

    it("different inputs produce different hashes", () => {
      const hash1 = hashToken("test1");
      const hash2 = hashToken("test2");
      expect(hash1).not.toBe(hash2);
    });
  });

  describe("sanitizeInput", () => {
    it("escapes HTML entities", () => {
      expect(sanitizeInput("<script>alert('xss')</script>")).not.toContain("<script>");
    });

    it("escapes angle brackets", () => {
      expect(sanitizeInput("<b>bold</b>")).toBe("&lt;b&gt;bold&lt;&#x2F;b&gt;");
    });

    it("preserves normal text", () => {
      expect(sanitizeInput("Hello World")).toBe("Hello World");
    });

    it("escapes quotes", () => {
      expect(sanitizeInput('"test"')).toBe("&quot;test&quot;");
    });
  });

  describe("sanitizeEmail", () => {
    it("lowercases and trims", () => {
      expect(sanitizeEmail("  USER@Test.COM  ")).toBe("user@test.com");
    });
  });

  describe("CSRF tokens", () => {
    it("generates valid token", () => {
      const token = generateCsrfToken();
      expect(token).toHaveLength(64);
    });

    it("verifies matching tokens", () => {
      const token = generateCsrfToken();
      expect(verifyCsrfToken(token, token)).toBe(true);
    });

    it("rejects mismatched tokens", () => {
      const t1 = generateCsrfToken();
      const t2 = generateCsrfToken();
      expect(verifyCsrfToken(t1, t2)).toBe(false);
    });
  });

  describe("maskSensitive", () => {
    it("masks data showing first 4 chars", () => {
      expect(maskSensitive("1234567890")).toBe("1234****");
    });

    it("handles short strings", () => {
      expect(maskSensitive("ab")).toBe("****");
    });
  });
});
