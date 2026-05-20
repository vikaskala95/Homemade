import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cart = await db.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                vendor: { select: { id: true, storeName: true, slug: true } },
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ cart });
  } catch (error) {
    console.error("Cart fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, quantity = 1 } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    const product = await db.product.findUnique({ where: { id: productId } });
    if (!product || product.status !== "ACTIVE") {
      return NextResponse.json({ error: "Product not available" }, { status: 404 });
    }

    if (product.stock < quantity) {
      return NextResponse.json({ error: "Insufficient stock" }, { status: 400 });
    }

    let cart = await db.cart.findUnique({
      where: { userId: session.user.id },
    });

    if (!cart) {
      cart = await db.cart.create({
        data: { userId: session.user.id },
      });
    }

    const existingItem = await db.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    if (existingItem) {
      const newQty = Math.min(existingItem.quantity + quantity, product.stock);
      await db.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQty },
      });
    } else {
      await db.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity: Math.min(quantity, product.stock),
        },
      });
    }

    return NextResponse.json({ message: "Added to cart" });
  } catch (error) {
    console.error("Cart add error:", error);
    return NextResponse.json({ error: "Failed to add to cart" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { itemId, quantity } = await req.json();

    if (!itemId || quantity == null) {
      return NextResponse.json({ error: "Item ID and quantity required" }, { status: 400 });
    }

    if (quantity <= 0) {
      await db.cartItem.delete({ where: { id: itemId } });
      return NextResponse.json({ message: "Item removed" });
    }

    await db.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    return NextResponse.json({ message: "Cart updated" });
  } catch (error) {
    console.error("Cart update error:", error);
    return NextResponse.json({ error: "Failed to update cart" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");

    if (itemId) {
      await db.cartItem.delete({ where: { id: itemId } });
    } else {
      const cart = await db.cart.findUnique({
        where: { userId: session.user.id },
      });
      if (cart) {
        await db.cartItem.deleteMany({ where: { cartId: cart.id } });
      }
    }

    return NextResponse.json({ message: "Cart cleared" });
  } catch (error) {
    console.error("Cart delete error:", error);
    return NextResponse.json({ error: "Failed to clear cart" }, { status: 500 });
  }
}
