import Link from "next/link";
import { Store } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Store className="h-6 w-6 text-orange-500" />
              <span className="text-lg font-bold text-white">
                Homemade<span className="text-orange-500">Everything</span>
              </span>
            </div>
            <p className="text-sm">
              India&apos;s premier marketplace for authentic homemade products.
              From kitchens to craft rooms, discover the best of local artisans.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/products" className="hover:text-orange-400 transition">Browse Products</Link></li>
              <li><Link href="/categories" className="hover:text-orange-400 transition">Categories</Link></li>
              <li><Link href="/vendors" className="hover:text-orange-400 transition">Our Vendors</Link></li>
              <li><Link href="/about" className="hover:text-orange-400 transition">About Us</Link></li>
            </ul>
          </div>

          {/* For Vendors */}
          <div>
            <h3 className="text-white font-semibold mb-4">For Vendors</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/vendor/register" className="hover:text-orange-400 transition">Become a Vendor</Link></li>
              <li><Link href="/vendor/dashboard" className="hover:text-orange-400 transition">Vendor Dashboard</Link></li>
              <li><Link href="/help" className="hover:text-orange-400 transition">Seller Guidelines</Link></li>
              <li><Link href="/help" className="hover:text-orange-400 transition">Commission Info</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/help" className="hover:text-orange-400 transition">Help Center</Link></li>
              <li><Link href="/privacy" className="hover:text-orange-400 transition">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-orange-400 transition">Terms of Service</Link></li>
              <li><Link href="/contact" className="hover:text-orange-400 transition">Contact Us</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Homemade Everything. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
