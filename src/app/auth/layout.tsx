import Link from "next/link";
import { Store } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication",
  description: "Sign in or create an account on Homemade Everything",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Minimal header */}
      <header className="w-full px-6 py-4">
        <Link href="/" className="inline-flex items-center space-x-2 group">
          <Store className="h-7 w-7 text-orange-600 transition-transform group-hover:scale-110" />
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            Homemade<span className="text-orange-600">Everything</span>
          </span>
        </Link>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        {children}
      </main>

      {/* Minimal footer */}
      <footer className="w-full px-6 py-4 text-center text-xs text-gray-400 dark:text-gray-600">
        &copy; {new Date().getFullYear()} Homemade Everything. All rights reserved.
      </footer>
    </div>
  );
}
