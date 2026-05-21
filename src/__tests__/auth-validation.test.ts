import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  getPasswordStrength,
} from "@/lib/validations/auth";

describe("Auth Validation Schemas", () => {
  describe("loginSchema", () => {
    it("accepts valid login data", () => {
      const result = loginSchema.safeParse({
        email: "test@example.com",
        password: "password123",
        rememberMe: true,
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty email", () => {
      const result = loginSchema.safeParse({
        email: "",
        password: "password123",
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid email format", () => {
      const result = loginSchema.safeParse({
        email: "not-an-email",
        password: "password123",
      });
      expect(result.success).toBe(false);
    });

    it("rejects empty password", () => {
      const result = loginSchema.safeParse({
        email: "test@example.com",
        password: "",
      });
      expect(result.success).toBe(false);
    });

    it("defaults rememberMe to false", () => {
      const result = loginSchema.safeParse({
        email: "test@example.com",
        password: "password123",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.rememberMe).toBe(false);
      }
    });
  });

  describe("registerSchema", () => {
    const validData = {
      name: "John Doe",
      email: "john@example.com",
      phone: "9876543210",
      password: "Test@123!",
      confirmPassword: "Test@123!",
      role: "CUSTOMER" as const,
    };

    it("accepts valid registration data", () => {
      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("rejects short name", () => {
      const result = registerSchema.safeParse({ ...validData, name: "J" });
      expect(result.success).toBe(false);
    });

    it("rejects name with numbers", () => {
      const result = registerSchema.safeParse({ ...validData, name: "John123" });
      expect(result.success).toBe(false);
    });

    it("rejects weak password", () => {
      const result = registerSchema.safeParse({
        ...validData,
        password: "weak",
        confirmPassword: "weak",
      });
      expect(result.success).toBe(false);
    });

    it("rejects mismatched passwords", () => {
      const result = registerSchema.safeParse({
        ...validData,
        confirmPassword: "DifferentPass@1",
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid phone number", () => {
      const result = registerSchema.safeParse({
        ...validData,
        phone: "1234567890",
      });
      expect(result.success).toBe(false);
    });

    it("allows empty phone", () => {
      const result = registerSchema.safeParse({
        ...validData,
        phone: "",
      });
      expect(result.success).toBe(true);
    });

    it("accepts all valid roles", () => {
      for (const role of ["CUSTOMER", "VENDOR", "DELIVERY"] as const) {
        const result = registerSchema.safeParse({ ...validData, role });
        expect(result.success).toBe(true);
      }
    });

    it("rejects invalid role", () => {
      const result = registerSchema.safeParse({ ...validData, role: "SUPERADMIN" });
      expect(result.success).toBe(false);
    });
  });

  describe("forgotPasswordSchema", () => {
    it("accepts valid email", () => {
      const result = forgotPasswordSchema.safeParse({ email: "test@example.com" });
      expect(result.success).toBe(true);
    });

    it("rejects invalid email", () => {
      const result = forgotPasswordSchema.safeParse({ email: "bad" });
      expect(result.success).toBe(false);
    });
  });

  describe("resetPasswordSchema", () => {
    it("accepts valid reset data", () => {
      const result = resetPasswordSchema.safeParse({
        token: "some-token",
        password: "NewPass@123",
        confirmPassword: "NewPass@123",
      });
      expect(result.success).toBe(true);
    });

    it("rejects mismatched passwords", () => {
      const result = resetPasswordSchema.safeParse({
        token: "some-token",
        password: "NewPass@123",
        confirmPassword: "Different@123",
      });
      expect(result.success).toBe(false);
    });

    it("rejects empty token", () => {
      const result = resetPasswordSchema.safeParse({
        token: "",
        password: "NewPass@123",
        confirmPassword: "NewPass@123",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("getPasswordStrength", () => {
    it("returns 0 for empty password", () => {
      expect(getPasswordStrength("").score).toBe(0);
    });

    it("returns 1 for 8+ char password only", () => {
      expect(getPasswordStrength("abcdefgh").score).toBe(1);
    });

    it("returns higher score for mixed case with numbers", () => {
      const { score } = getPasswordStrength("Abcdef1!");
      expect(score).toBeGreaterThanOrEqual(3);
    });

    it("returns max score for strong password", () => {
      const { score, label } = getPasswordStrength("MyStr0ng!Pass");
      expect(score).toBe(4);
      expect(label).toBe("Very Strong");
    });
  });
});
