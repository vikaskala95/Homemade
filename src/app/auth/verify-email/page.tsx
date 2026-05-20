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
    <Card className="w-full max-w-md">
      <CardContent className="py-12 text-center">
        {status === "loading" && (
          <>
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-orange-500" />
            <p className="text-lg font-medium">Verifying your email...</p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">Email Verified!</p>
            <p className="text-gray-500 text-sm mb-6">Your email has been verified successfully.</p>
            <Link href="/dashboard">
              <Button className="bg-orange-600 hover:bg-orange-700">Go to Dashboard</Button>
            </Link>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">Verification Failed</p>
            <p className="text-gray-500 text-sm mb-6">The link is invalid or has expired.</p>
            <Link href="/dashboard">
              <Button variant="outline">Go to Dashboard</Button>
            </Link>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Suspense fallback={<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600" />}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
