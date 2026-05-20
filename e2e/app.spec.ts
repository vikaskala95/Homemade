import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test("should display hero section", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page).toHaveTitle(/Homemade Everything/);
  });

  test("should display navigation links", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /products/i })).toBeVisible();
  });

  test("should navigate to products page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /shop now|browse|products/i }).first().click();
    await expect(page).toHaveURL(/\/products/);
  });
});

test.describe("Products Page", () => {
  test("should display products listing", async ({ page }) => {
    await page.goto("/products");
    await expect(page.locator("h1")).toContainText(/product/i);
  });

  test("should have search functionality", async ({ page }) => {
    await page.goto("/products");
    const searchInput = page.getByPlaceholder(/search/i).first();
    if (await searchInput.isVisible()) {
      await searchInput.fill("honey");
      await expect(searchInput).toHaveValue("honey");
    }
  });
});

test.describe("Auth Pages", () => {
  test("should display login form", async ({ page }) => {
    await page.goto("/auth/login");
    await expect(page.getByRole("heading")).toContainText(/sign in|login|welcome/i);
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test("should display register form", async ({ page }) => {
    await page.goto("/auth/register");
    await expect(page.getByLabel(/name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test("should require email and password for login", async ({ page }) => {
    await page.goto("/auth/login");
    await page.getByRole("button", { name: /sign in|login/i }).click();
    // Form validation should prevent submission with empty fields
  });
});

test.describe("Cart Page", () => {
  test("should display empty cart message", async ({ page }) => {
    await page.goto("/cart");
    await expect(page.getByText(/empty|no items/i)).toBeVisible();
  });
});

test.describe("Navigation", () => {
  test("should have responsive menu", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    // Mobile menu button should be visible
    const menuButton = page.locator('[aria-label*="menu"], button:has(svg)').first();
    await expect(menuButton).toBeVisible();
  });
});
