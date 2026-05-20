import { test, expect } from "@playwright/test";

test.describe("Auth Flow", () => {
  test("forgot password page loads", async ({ page }) => {
    await page.goto("/auth/forgot-password");
    await expect(page.getByText("Forgot Password")).toBeVisible();
    await expect(page.getByPlaceholder("you@example.com")).toBeVisible();
  });

  test("forgot password form submits", async ({ page }) => {
    await page.goto("/auth/forgot-password");
    await page.getByPlaceholder("you@example.com").fill("test@example.com");
    await page.getByRole("button", { name: /send reset link/i }).click();
    // Should show success or redirect
    await expect(page.getByText(/check your email|reset link sent/i)).toBeVisible({ timeout: 10000 });
  });

  test("reset password page handles invalid token", async ({ page }) => {
    await page.goto("/auth/reset-password?token=invalid-token");
    await expect(page.getByText(/reset password|invalid/i)).toBeVisible();
  });

  test("verify email page handles invalid token", async ({ page }) => {
    await page.goto("/auth/verify-email?token=invalid-token");
    await expect(page.getByText(/verification failed|invalid/i)).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Admin Access Control", () => {
  test("admin page redirects unauthenticated users", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test("vendor page redirects unauthenticated users", async ({ page }) => {
    await page.goto("/vendor/dashboard");
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});

test.describe("API Health", () => {
  test("health endpoint returns healthy", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.status).toBe("healthy");
    expect(data).toHaveProperty("uptime");
    expect(data).toHaveProperty("timestamp");
  });
});

test.describe("Product Browsing", () => {
  test("products API returns valid response", async ({ request }) => {
    const response = await request.get("/api/products?page=1&limit=5");
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty("products");
    expect(data).toHaveProperty("pagination");
    expect(Array.isArray(data.products)).toBe(true);
  });

  test("categories API returns valid response", async ({ request }) => {
    const response = await request.get("/api/categories");
    expect(response.status()).toBe(200);
  });

  test("recommendations API returns trending products", async ({ request }) => {
    const response = await request.get("/api/products/recommendations?type=trending&limit=5");
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty("products");
    expect(data.type).toBe("trending");
  });

  test("search suggestions API works", async ({ request }) => {
    const response = await request.get("/api/products/search-suggestions?q=honey");
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty("suggestions");
  });
});

test.describe("SEO", () => {
  test("robots.txt is accessible", async ({ request }) => {
    const response = await request.get("/robots.txt");
    expect(response.status()).toBe(200);
    const text = await response.text();
    expect(text).toContain("User-Agent");
  });

  test("sitemap.xml is accessible", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    expect(response.status()).toBe(200);
  });

  test("homepage has meta tags", async ({ page }) => {
    await page.goto("/");
    const title = await page.title();
    expect(title).toContain("Homemade");

    const description = await page.getAttribute('meta[name="description"]', "content");
    expect(description).toBeTruthy();
  });

  test("homepage has JSON-LD structured data", async ({ page }) => {
    await page.goto("/");
    const jsonLd = await page.locator('script[type="application/ld+json"]').first().textContent();
    expect(jsonLd).toBeTruthy();
    const parsed = JSON.parse(jsonLd!);
    expect(parsed["@context"]).toBe("https://schema.org");
  });
});

test.describe("Security Headers", () => {
  test("responses include security headers", async ({ request }) => {
    const response = await request.get("/");
    const headers = response.headers();
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["strict-transport-security"]).toContain("max-age");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  });
});

test.describe("Accessibility", () => {
  test("homepage has proper heading structure", async ({ page }) => {
    await page.goto("/");
    const h1 = page.locator("h1");
    await expect(h1).toBeVisible();
    const h1Count = await h1.count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
  });

  test("login form has labels", async ({ page }) => {
    await page.goto("/auth/login");
    const labels = page.locator("label");
    const count = await labels.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test("images have alt text", async ({ page }) => {
    await page.goto("/");
    const images = page.locator("img");
    const count = await images.count();
    for (let i = 0; i < Math.min(count, 10); i++) {
      const alt = await images.nth(i).getAttribute("alt");
      expect(alt !== null).toBe(true);
    }
  });
});
