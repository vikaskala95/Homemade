"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, ArrowRight } from "lucide-react";

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
    <div className="w-full max-w-[420px] text-center">
      {status === "loading" && (
        <>
          <div className="w-16 h-16 rounded-2xl bg-orange-100 dark:bg-orange-950/50 flex items-center justify-center mx-auto mb-5">
            <Loader2 className="h-8 w-8 animate-spin text-orange-600 dark:text-orange-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Verifying your email...</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Please wait while we confirm your email address.</p>
        </>
      )}
      {status === "success" && (
        <>
          <div className="w-16 h-16 rounded-2xl bg-green-100 dark:bg-green-950/50 flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Email verified!</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
            Your email has been verified. You&apos;re all set to start exploring Homemade Everything.
          </p>
          <Link href="/dashboard">
            <Button className="h-11 rounded-xl bg-orange-600 hover:bg-orange-700 font-semibold shadow-lg shadow-orange-600/25 px-8">
              Go to Dashboard <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </>
      )}
      {status === "error" && (
        <>
          <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-950/50 flex items-center justify-center mx-auto mb-5">
            <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Verification failed</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
            This verification link is invalid or has expired. Please request a new one from your dashboard.
          </p>
          <Link href="/dashboard">
            <Button variant="outline" className="h-11 rounded-xl border-gray-200 dark:border-gray-800 dark:hover:bg-gray-900 px-8">
              Go to Dashboard
            </Button>
          </Link>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-[420px] text-center">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse mx-auto mb-5" />
        <div className="h-7 w-48 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse mx-auto mb-2" />
        <div className="h-4 w-64 rounded bg-gray-100 dark:bg-gray-800 animate-pulse mx-auto" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
