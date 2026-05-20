import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock next-auth
jest.mock("next-auth/react", () => ({
  useSession: () => ({ data: null, status: "unauthenticated" }),
  SessionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), refresh: jest.fn() }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

describe("Auth Pages", () => {
  describe("ForgotPasswordPage", () => {
    it("renders forgot password form", async () => {
      const { default: ForgotPasswordPage } = await import("@/app/auth/forgot-password/page");
      render(<ForgotPasswordPage />);
      expect(screen.getByText("Forgot Password")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
      expect(screen.getByText("Send Reset Link")).toBeInTheDocument();
    });

    it("has back to login link", async () => {
      const { default: ForgotPasswordPage } = await import("@/app/auth/forgot-password/page");
      render(<ForgotPasswordPage />);
      expect(screen.getByText("Back to Login")).toBeInTheDocument();
    });
  });
});

describe("Cart Store", () => {
  it("adds items and calculates total", async () => {
    const { useCartStore } = await import("@/store/cart-store");

    // Reset store
    useCartStore.setState({ items: [] });

    useCartStore.getState().addItem({
      productId: "p1",
      name: "Test Product",
      price: 100,
      image: "test.jpg",
      quantity: 2,
      vendorId: "v1",
      vendorName: "Vendor 1",
      stock: 10,
    });

    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().getTotal()).toBe(200);
  });

  it("removes items", async () => {
    const { useCartStore } = await import("@/store/cart-store");
    useCartStore.setState({ items: [] });

    useCartStore.getState().addItem({
      productId: "p2",
      name: "Test",
      price: 50,
      image: "",
      quantity: 1,
      vendorId: "v1",
      vendorName: "V",
      stock: 5,
    });

    useCartStore.getState().removeItem("p2");
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it("updates quantity", async () => {
    const { useCartStore } = await import("@/store/cart-store");
    useCartStore.setState({ items: [] });

    useCartStore.getState().addItem({
      productId: "p3",
      name: "Test",
      price: 50,
      image: "",
      quantity: 1,
      vendorId: "v1",
      vendorName: "V",
      stock: 10,
    });

    useCartStore.getState().updateQuantity("p3", 5);
    expect(useCartStore.getState().items[0].quantity).toBe(5);
  });

  it("clears cart", async () => {
    const { useCartStore } = await import("@/store/cart-store");
    useCartStore.getState().addItem({
      productId: "p4",
      name: "T",
      price: 10,
      image: "",
      quantity: 1,
      vendorId: "v1",
      vendorName: "V",
      stock: 5,
    });
    useCartStore.getState().clearCart();
    expect(useCartStore.getState().items).toHaveLength(0);
  });
});
