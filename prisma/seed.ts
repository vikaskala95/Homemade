import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create Admin User
  const adminPassword = await bcrypt.hash("admin123456", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@homemadeeverything.com" },
    update: {},
    create: {
      email: "admin@homemadeeverything.com",
      name: "Admin",
      password: adminPassword,
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });
  console.log("✅ Admin user created:", admin.email);

  // Create Categories
  const categories = [
    { name: "Homemade Food", slug: "homemade-food", description: "Fresh homemade meals and dishes", sortOrder: 1 },
    { name: "Snacks", slug: "snacks", description: "Homemade snacks and namkeens", sortOrder: 2 },
    { name: "Bakery", slug: "bakery", description: "Fresh baked goods, cakes, and pastries", sortOrder: 3 },
    { name: "Handmade Crafts", slug: "handmade-crafts", description: "Handcrafted items and art", sortOrder: 4 },
    { name: "Organic Products", slug: "organic-products", description: "Natural and organic products", sortOrder: 5 },
    { name: "Pickles & Preserves", slug: "pickles", description: "Homemade pickles, jams, and preserves", sortOrder: 6 },
    { name: "Clothing", slug: "clothing", description: "Handmade and custom clothing", sortOrder: 7 },
    { name: "Art & Decor", slug: "art-decor", description: "Art pieces and home decor", sortOrder: 8 },
    { name: "Home Services", slug: "home-services", description: "Home-based services", sortOrder: 9 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log("✅ Categories created:", categories.length);

  // Create Demo Vendor
  const vendorPassword = await bcrypt.hash("vendor123456", 12);
  const vendorUser = await prisma.user.upsert({
    where: { email: "vendor@demo.com" },
    update: {},
    create: {
      email: "vendor@demo.com",
      name: "Priya's Kitchen",
      password: vendorPassword,
      role: "VENDOR",
      emailVerified: new Date(),
    },
  });

  const vendor = await prisma.vendor.upsert({
    where: { userId: vendorUser.id },
    update: {},
    create: {
      userId: vendorUser.id,
      storeName: "Priya's Kitchen",
      slug: "priyas-kitchen",
      description: "Authentic home-cooked meals and snacks made with love. Specializing in North Indian cuisine and traditional recipes passed down through generations.",
      phone: "+91 9876543210",
      email: "vendor@demo.com",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
      status: "APPROVED",
      isVerified: true,
      commission: 10,
    },
  });
  console.log("✅ Demo vendor created:", vendor.storeName);

  // Create Demo Customer
  const customerPassword = await bcrypt.hash("customer123456", 12);
  const customer = await prisma.user.upsert({
    where: { email: "customer@demo.com" },
    update: {},
    create: {
      email: "customer@demo.com",
      name: "Rahul Sharma",
      password: customerPassword,
      role: "CUSTOMER",
      emailVerified: new Date(),
    },
  });

  await prisma.cart.upsert({
    where: { userId: customer.id },
    update: {},
    create: { userId: customer.id },
  });
  console.log("✅ Demo customer created:", customer.email);

  // Create Demo Products
  const foodCategory = await prisma.category.findUnique({ where: { slug: "homemade-food" } });
  const snacksCategory = await prisma.category.findUnique({ where: { slug: "snacks" } });
  const bakeryCategory = await prisma.category.findUnique({ where: { slug: "bakery" } });
  const picklesCategory = await prisma.category.findUnique({ where: { slug: "pickles" } });

  if (foodCategory && snacksCategory && bakeryCategory && picklesCategory) {
    const products = [
      {
        vendorId: vendor.id,
        categoryId: foodCategory.id,
        name: "Homemade Paneer Butter Masala",
        slug: "homemade-paneer-butter-masala",
        description: "Rich and creamy paneer butter masala made with fresh paneer, butter, and a blend of aromatic spices. Serves 2-3 people. Ready to heat and eat!",
        shortDesc: "Rich and creamy paneer butter masala - serves 2-3",
        price: 250,
        comparePrice: 350,
        stock: 20,
        images: [],
        tags: ["paneer", "curry", "north-indian", "vegetarian"],
        isFeatured: true,
        status: "ACTIVE" as const,
        rating: 4.5,
        reviewCount: 12,
        soldCount: 45,
      },
      {
        vendorId: vendor.id,
        categoryId: snacksCategory.id,
        name: "Traditional Namkeen Mix",
        slug: "traditional-namkeen-mix",
        description: "Crunchy homemade namkeen mix with sev, chivda, peanuts, and special spices. A perfect tea-time snack. 500g pack.",
        shortDesc: "Crunchy homemade namkeen mix - 500g",
        price: 180,
        comparePrice: 220,
        stock: 50,
        images: [],
        tags: ["namkeen", "snacks", "tea-time", "crunchy"],
        isFeatured: true,
        status: "ACTIVE" as const,
        rating: 4.8,
        reviewCount: 25,
        soldCount: 120,
        isOrganic: false,
      },
      {
        vendorId: vendor.id,
        categoryId: bakeryCategory.id,
        name: "Chocolate Truffle Cake",
        slug: "chocolate-truffle-cake",
        description: "Decadent chocolate truffle cake made with premium cocoa and fresh cream. Perfect for celebrations. 1kg round cake.",
        shortDesc: "Decadent chocolate truffle cake - 1kg",
        price: 650,
        comparePrice: 800,
        stock: 10,
        images: [],
        tags: ["cake", "chocolate", "celebration", "birthday"],
        isFeatured: true,
        status: "ACTIVE" as const,
        rating: 4.9,
        reviewCount: 8,
        soldCount: 30,
      },
      {
        vendorId: vendor.id,
        categoryId: picklesCategory.id,
        name: "Mango Pickle (Aam ka Achar)",
        slug: "mango-pickle-aam-ka-achar",
        description: "Traditional homemade mango pickle made with raw mangoes, mustard oil, and authentic spices. 500g glass jar.",
        shortDesc: "Traditional mango pickle - 500g jar",
        price: 199,
        stock: 30,
        images: [],
        tags: ["pickle", "mango", "traditional", "achar"],
        isFeatured: true,
        status: "ACTIVE" as const,
        rating: 4.7,
        reviewCount: 15,
        soldCount: 80,
        isOrganic: true,
      },
    ];

    for (const product of products) {
      await prisma.product.upsert({
        where: { slug: product.slug },
        update: {},
        create: product,
      });
    }
    console.log("✅ Demo products created:", products.length);
  }

  // Create Banners
  await prisma.banner.upsert({
    where: { id: "banner-1" },
    update: {},
    create: {
      id: "banner-1",
      title: "Fresh Homemade Products",
      image: "/banners/hero-1.jpg",
      link: "/products",
      isActive: true,
      sortOrder: 1,
    },
  });

  await prisma.banner.upsert({
    where: { id: "banner-2" },
    update: {},
    create: {
      id: "banner-2",
      title: "Organic & Natural",
      image: "/banners/hero-2.jpg",
      link: "/products?organic=true",
      isActive: true,
      sortOrder: 2,
    },
  });
  console.log("✅ Banners created");

  // Create additional vendors for richer test data
  const vendor2Password = await bcrypt.hash("vendor123456", 12);
  const vendor2User = await prisma.user.upsert({
    where: { email: "vendor2@demo.com" },
    update: {},
    create: {
      email: "vendor2@demo.com",
      name: "Grandma's Recipes",
      password: vendor2Password,
      role: "VENDOR",
      emailVerified: new Date(),
    },
  });

  const vendor2 = await prisma.vendor.upsert({
    where: { userId: vendor2User.id },
    update: {},
    create: {
      userId: vendor2User.id,
      storeName: "Grandma's Recipes",
      slug: "grandmas-recipes",
      description: "Authentic traditional recipes from grandmother's kitchen.",
      phone: "+91 9876543211",
      email: "vendor2@demo.com",
      city: "Delhi",
      state: "Delhi",
      pincode: "110001",
      status: "APPROVED",
      isVerified: true,
      commission: 10,
    },
  });
  console.log("✅ Additional vendor created:", vendor2.storeName);

  // Create a coupon
  await prisma.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: {
      code: "WELCOME10",
      type: "PERCENTAGE",
      value: 10,
      minOrder: 200,
      maxDiscount: 100,
      usageLimit: 100,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  });

  await prisma.coupon.upsert({
    where: { code: "FLAT50" },
    update: {},
    create: {
      code: "FLAT50",
      type: "FIXED",
      value: 50,
      minOrder: 500,
      usageLimit: 50,
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  });
  console.log("✅ Coupons created");

  // Create demo addresses for customer
  await prisma.address.upsert({
    where: { id: "addr-1" },
    update: {},
    create: {
      id: "addr-1",
      userId: customer.id,
      name: "Rahul Sharma",
      phone: "+91 9876543212",
      address: "123, MG Road, Koramangala",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560034",
      isDefault: true,
    },
  });
  console.log("✅ Demo addresses created");

  // Create notifications for demo
  await prisma.notification.createMany({
    data: [
      {
        userId: customer.id,
        type: "SYSTEM",
        title: "Welcome to Homemade Everything!",
        message: "Start exploring authentic homemade products from local vendors.",
        link: "/products",
      },
      {
        userId: customer.id,
        type: "PROMOTION",
        title: "Use code WELCOME10",
        message: "Get 10% off on your first order!",
        link: "/products",
      },
    ],
    skipDuplicates: true,
  });
  console.log("✅ Demo notifications created");

  console.log("\n🎉 Seed completed successfully!");
  console.log("\n📝 Demo Accounts:");
  console.log("   Admin:    admin@homemadeeverything.com / admin123456");
  console.log("   Vendor:   vendor@demo.com / vendor123456");
  console.log("   Vendor2:  vendor2@demo.com / vendor123456");
  console.log("   Customer: customer@demo.com / customer123456");
  console.log("\n🎟️  Coupons: WELCOME10 (10% off), FLAT50 (₹50 off)");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
