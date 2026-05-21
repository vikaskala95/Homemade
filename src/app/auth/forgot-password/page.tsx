"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/lib/validations/auth";
import toast from "react-hot-toast";
import { Loader2, ArrowLeft, Mail, ArrowRight } from "lucide-react";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });
      if (res.ok) {
        setSent(true);
        toast.success("Reset link sent if account exists");
      } else {
        const result = await res.json();
        toast.error(result.error || "Something went wrong");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="w-full max-w-[420px]">
      {sent ? (
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-orange-100 dark:bg-orange-950/50 flex items-center justify-center mx-auto mb-5">
            <Mail className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Check your email</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 max-w-xs mx-auto">
            If an account with that email exists, we&apos;ve sent a password reset link. Check your inbox and spam folder.
          </p>
          <Link href="/auth/login">
            <Button variant="outline" className="w-full h-11 rounded-xl border-gray-200 dark:border-gray-800 dark:hover:bg-gray-900">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Sign In
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Forgot password?
            </h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              No worries, we&apos;ll send you a reset link to your email.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...register("email")}
                  className="pl-10 h-11 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100"
                  autoFocus
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500" role="alert">{errors.email.message}</p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full h-11 rounded-xl bg-orange-600 hover:bg-orange-700 font-semibold shadow-lg shadow-orange-600/25"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending...</>
              ) : (
                <>Send Reset Link<ArrowRight className="h-4 w-4 ml-2" /></>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Remember your password?{" "}
            <Link href="/auth/login" className="text-orange-600 font-semibold hover:text-orange-700 transition-colors">
              Sign in
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
