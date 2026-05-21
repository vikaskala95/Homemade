"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <SessionProvider>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "var(--toast-bg, #fff)",
              color: "var(--toast-color, #333)",
              border: "1px solid var(--toast-border, #e5e7eb)",
            },
          }}
        />
      </SessionProvider>
    </ThemeProvider>
  );
}
