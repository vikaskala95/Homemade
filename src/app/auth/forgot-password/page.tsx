"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/lib/validations/auth";
import toast from "react-hot-toast";
import { Loader2, ArrowLeft, Mail } from "lucide-react";

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
    <Card className="w-full max-w-md shadow-xl border-0 dark:bg-gray-900 dark:border dark:border-gray-800">
      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-2xl font-bold dark:text-white">Forgot Password</CardTitle>
        <CardDescription className="dark:text-gray-400">
          Enter your email to receive a password reset link
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sent ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-950 flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
            <p className="text-lg font-medium mb-2 dark:text-white">Check your email</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              If an account with that email exists, we&apos;ve sent a password reset link.
            </p>
            <Link href="/auth/login">
              <Button variant="outline" className="w-full dark:border-gray-700 dark:hover:bg-gray-800">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Login
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="dark:text-gray-300">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...register("email")}
                  className="pl-10 h-10 rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  autoFocus
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500" role="alert">{errors.email.message}</p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full h-10 rounded-lg bg-orange-600 hover:bg-orange-700"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Send Reset Link
            </Button>
            <div className="text-center">
              <Link href="/auth/login" className="text-sm text-orange-600 hover:underline">
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
