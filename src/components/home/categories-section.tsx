import Link from "next/link";
import {
  UtensilsCrossed,
  Cookie,
  Cake,
  Palette,
  Leaf,
  Shirt,
  Hammer,
  Home,
  Gift,
} from "lucide-react";

const categories = [
  { name: "Homemade Food", slug: "homemade-food", icon: UtensilsCrossed, color: "bg-red-50 text-red-600" },
  { name: "Snacks", slug: "snacks", icon: Cookie, color: "bg-yellow-50 text-yellow-600" },
  { name: "Bakery", slug: "bakery", icon: Cake, color: "bg-pink-50 text-pink-600" },
  { name: "Handmade Crafts", slug: "handmade-crafts", icon: Palette, color: "bg-purple-50 text-purple-600" },
  { name: "Organic Products", slug: "organic-products", icon: Leaf, color: "bg-green-50 text-green-600" },
  { name: "Pickles & Preserves", slug: "pickles", icon: Gift, color: "bg-orange-50 text-orange-600" },
  { name: "Clothing", slug: "clothing", icon: Shirt, color: "bg-blue-50 text-blue-600" },
  { name: "Art & Decor", slug: "art-decor", icon: Hammer, color: "bg-indigo-50 text-indigo-600" },
  { name: "Home Services", slug: "home-services", icon: Home, color: "bg-teal-50 text-teal-600" },
];

export function CategoriesSection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Shop by Category</h2>
          <p className="mt-2 text-gray-600">
            Explore our wide range of homemade product categories
          </p>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-4">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.slug}
                href={`/products?category=${category.slug}`}
                className="flex flex-col items-center p-4 rounded-xl hover:shadow-md transition-shadow group"
              >
                <div className={`p-3 rounded-xl ${category.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="h-6 w-6" />
                </div>
                <span className="mt-2 text-xs font-medium text-gray-700 text-center">
                  {category.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
