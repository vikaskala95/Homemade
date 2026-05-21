"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }

    fetch("/api/auth/verify-email", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((res) => {
        setStatus(res.ok ? "success" : "error");
      })
      .catch(() => setStatus("error"));
  }, [token]);

  return (
    <Card className="w-full max-w-md shadow-xl border-0 dark:bg-gray-900 dark:border dark:border-gray-800">
      <CardContent className="py-12 text-center">
        {status === "loading" && (
          <>
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-orange-500" />
            <p className="text-lg font-medium dark:text-white">Verifying your email...</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-lg font-medium mb-2 dark:text-white">Email Verified!</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Your email has been verified successfully.</p>
            <Link href="/dashboard">
              <Button className="bg-orange-600 hover:bg-orange-700 rounded-lg">Go to Dashboard</Button>
            </Link>
          </>
        )}
        {status === "error" && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <p className="text-lg font-medium mb-2 dark:text-white">Verification Failed</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">The link is invalid or has expired.</p>
            <Link href="/dashboard">
              <Button variant="outline" className="dark:border-gray-700">Go to Dashboard</Button>
            </Link>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-md h-[300px] rounded-xl bg-white/50 dark:bg-gray-900/50 animate-pulse" />
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
