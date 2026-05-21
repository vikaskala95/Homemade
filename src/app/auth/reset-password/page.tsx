"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/auth/password-input";
import { PasswordStrength } from "@/components/auth/password-strength";
import { resetPasswordSchema, type ResetPasswordFormData } from "@/lib/validations/auth";
import toast from "react-hot-toast";
import { Loader2, CheckCircle, ArrowRight, AlertTriangle } from "lucide-react";
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
      <div className="w-full max-w-[420px] text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-950/50 flex items-center justify-center mx-auto mb-5">
          <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Invalid reset link</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
          This link is invalid or has expired. Please request a new one.
        </p>
        <Link href="/auth/forgot-password">
          <Button className="h-11 rounded-xl bg-orange-600 hover:bg-orange-700 font-semibold px-8">
            Request New Link
          </Button>
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="w-full max-w-[420px] text-center">
        <div className="w-16 h-16 rounded-2xl bg-green-100 dark:bg-green-950/50 flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Password updated!</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Your password has been reset successfully.</p>
        <p className="text-gray-400 dark:text-gray-500 text-sm">Redirecting to sign in...</p>
      </div>
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
    <div className="w-full max-w-[420px]">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Set new password
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Choose a strong password for your Homemade Everything account.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <input type="hidden" {...register("token")} />
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            New Password
          </Label>
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
        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Confirm Password
          </Label>
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
          className="w-full h-11 rounded-xl bg-orange-600 hover:bg-orange-700 font-semibold shadow-lg shadow-orange-600/25"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Resetting...</>
          ) : (
            <>Reset Password<ArrowRight className="h-4 w-4 ml-2" /></>
          )}
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-[420px] space-y-4">
        <div className="h-8 w-48 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
        <div className="h-4 w-64 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
        <div className="h-11 w-full rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse mt-8" />
        <div className="h-11 w-full rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
        <div className="h-11 w-full rounded-xl bg-orange-100 dark:bg-orange-900/30 animate-pulse mt-2" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
