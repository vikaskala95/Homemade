import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth?.user;
  const role = req.auth?.user?.role;

  const protectedRoutes = ["/dashboard", "/orders", "/cart", "/checkout", "/wishlist"];
  const vendorRoutes = ["/vendor/dashboard", "/vendor/products", "/vendor/orders", "/vendor/analytics", "/vendor/settings"];
  const adminRoutes = ["/admin"];
  const deliveryRoutes = ["/delivery"];
  const authRoutes = ["/auth/login", "/auth/register"];

  // Redirect logged in users from auth pages
  if (isLoggedIn && authRoutes.some((r) => nextUrl.pathname.startsWith(r))) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  // Protect routes that require authentication
  if (!isLoggedIn && protectedRoutes.some((r) => nextUrl.pathname.startsWith(r))) {
    const loginUrl = new URL("/auth/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Vendor routes
  if (vendorRoutes.some((r) => nextUrl.pathname.startsWith(r))) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/auth/login", nextUrl);
      loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (role !== "VENDOR" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/vendor/register", nextUrl));
    }
  }

  // Admin routes
  if (adminRoutes.some((r) => nextUrl.pathname.startsWith(r))) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/auth/login", nextUrl);
      loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
  }

  // Delivery routes
  if (deliveryRoutes.some((r) => nextUrl.pathname.startsWith(r))) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/auth/login", nextUrl);
      loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (role !== "DELIVERY" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
};
