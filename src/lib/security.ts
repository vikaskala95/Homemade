import crypto from "crypto";

/**
 * Generate a cryptographically secure token
 */
export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Hash a token for storage (so raw tokens aren't stored in DB)
 */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Sanitize user input - strip potential XSS vectors
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Validate and sanitize email address
 */
export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

/**
 * Generate CSRF token
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Verify CSRF token
 */
export function verifyCsrfToken(token: string, storedToken: string): boolean {
  if (!token || !storedToken) return false;
  return crypto.timingSafeEqual(
    Buffer.from(token),
    Buffer.from(storedToken)
  );
}

/**
 * Mask sensitive data for logging
 */
export function maskSensitive(data: string, visibleChars: number = 4): string {
  if (data.length <= visibleChars) return "****";
  return data.substring(0, visibleChars) + "****";
}
