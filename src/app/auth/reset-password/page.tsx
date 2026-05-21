"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/auth/password-input";
import { PasswordStrength } from "@/components/auth/password-strength";
import { resetPasswordSchema, type ResetPasswordFormData } from "@/lib/validations/auth";
import toast from "react-hot-toast";
import { Loader2, CheckCircle } from "lucide-react";
import { useState } from "react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: token || "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");

  if (!token) {
    return (
      <Card className="w-full max-w-md shadow-xl border-0 dark:bg-gray-900 dark:border dark:border-gray-800">
        <CardContent className="py-8 text-center">
          <p className="text-red-500 mb-4">Invalid reset link</p>
          <Link href="/auth/forgot-password">
            <Button variant="outline" className="dark:border-gray-700">Request New Link</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (success) {
    return (
      <Card className="w-full max-w-md shadow-xl border-0 dark:bg-gray-900 dark:border dark:border-gray-800">
        <CardContent className="py-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-lg font-medium mb-2 dark:text-white">Password Reset!</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Redirecting to login...</p>
        </CardContent>
      </Card>
    );
  }

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: data.token, password: data.password }),
      });
      const result = await res.json();
      if (res.ok) {
        setSuccess(true);
        toast.success("Password reset successfully!");
        setTimeout(() => router.push("/auth/login"), 3000);
      } else {
        toast.error(result.error || "Something went wrong");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <Card className="w-full max-w-md shadow-xl border-0 dark:bg-gray-900 dark:border dark:border-gray-800">
      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-2xl font-bold dark:text-white">Reset Password</CardTitle>
        <CardDescription className="dark:text-gray-400">Enter your new password</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register("token")} />
          <div className="space-y-2">
            <Label htmlFor="password" className="dark:text-gray-300">New Password</Label>
            <PasswordInput
              id="password"
              placeholder="Enter new password"
              {...register("password")}
              autoComplete="new-password"
            />
            <PasswordStrength password={password} />
            {errors.password && (
              <p className="text-xs text-red-500" role="alert">{errors.password.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="dark:text-gray-300">Confirm Password</Label>
            <PasswordInput
              id="confirmPassword"
              placeholder="Repeat new password"
              showIcon={false}
              {...register("confirmPassword")}
              autoComplete="new-password"
              className="pl-3"
            />
            {errors.confirmPassword && (
              <p className="text-xs text-red-500" role="alert">{errors.confirmPassword.message}</p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full h-10 rounded-lg bg-orange-600 hover:bg-orange-700"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Reset Password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-md h-[400px] rounded-xl bg-white/50 dark:bg-gray-900/50 animate-pulse" />
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
