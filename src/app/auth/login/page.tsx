"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PasswordInput } from "@/components/auth/password-input";
import { SocialLogin } from "@/components/auth/social-login";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";
import { Mail, Loader2, Phone, AlertCircle, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const error = searchParams.get("error");

  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");

  // Phone OTP state
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const rememberMe = watch("rememberMe");

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await signIn("credentials", {
        email: data.email.toLowerCase().trim(),
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid email or password");
      } else {
        toast.success("Welcome back!");
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleSendOtp = async () => {
    if (!/^[6-9]\d{9}$/.test(phone)) {
      toast.error("Enter a valid 10-digit Indian mobile number");
      return;
    }
    setSendingOtp(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      if (res.ok) {
        setOtpSent(true);
        toast.success("OTP sent to your phone");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to send OTP");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });
      if (res.ok) {
        const data = await res.json();
        toast.success("Phone verified! Signing in...");
        if (data.user) {
          const result = await signIn("credentials", {
            email: `${phone}@phone.homemade.local`,
            password: "",
            redirect: false,
          });
          if (!result?.error) {
            router.push(callbackUrl);
            router.refresh();
          }
        }
      } else {
        const data = await res.json();
        toast.error(data.error || "Invalid OTP");
      }
    } catch {
      toast.error("Verification failed");
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[420px]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Sign in to continue shopping handmade goods
        </p>
      </div>

      {/* Auth error from URL params */}
      {error && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-50 text-red-700 text-sm mb-6 dark:bg-red-950/50 dark:text-red-400 border border-red-100 dark:border-red-900/50">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>
            {error === "OAuthAccountNotLinked"
              ? "This email is already linked to another sign-in method."
              : error === "MissingCSRF"
                ? "Session expired. Please try again."
                : "Authentication failed. Please try again."}
          </span>
        </div>
      )}

      {/* Social Login */}
      <SocialLogin callbackUrl={callbackUrl} label="Sign in" />

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-gray-800" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 text-gray-400 dark:bg-gray-950 dark:text-gray-500 font-medium">
            or continue with
          </span>
        </div>
      </div>

      {/* Login method toggle */}
      <div className="flex rounded-xl bg-gray-100 dark:bg-gray-900 p-1 mb-6">
        <button
          type="button"
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            loginMethod === "email"
              ? "bg-white shadow-sm text-gray-900 dark:bg-gray-800 dark:text-white"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          }`}
          onClick={() => setLoginMethod("email")}
        >
          <Mail className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5" /> Email
        </button>
        <button
          type="button"
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            loginMethod === "phone"
              ? "bg-white shadow-sm text-gray-900 dark:bg-gray-800 dark:text-white"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          }`}
          onClick={() => setLoginMethod("phone")}
        >
          <Phone className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5" /> Phone OTP
        </button>
      </div>

      {loginMethod === "email" ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email */}
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
                className="pl-10 h-11 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100 dark:focus:bg-gray-900"
                autoComplete="email"
                aria-invalid={!!errors.email}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-500 mt-1" role="alert">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </Label>
              <Link
                href="/auth/forgot-password"
                className="text-xs text-orange-600 hover:text-orange-700 font-medium transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <PasswordInput
              id="password"
              placeholder="Enter your password"
              {...register("password")}
              autoComplete="current-password"
              aria-invalid={!!errors.password}
            />
            {errors.password && (
              <p className="text-xs text-red-500 mt-1" role="alert">{errors.password.message}</p>
            )}
          </div>

          {/* Remember Me */}
          <div className="flex items-center space-x-2.5">
            <Checkbox
              id="rememberMe"
              checked={rememberMe}
              onCheckedChange={(checked) => setValue("rememberMe", !!checked)}
            />
            <Label htmlFor="rememberMe" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer font-normal">
              Keep me signed in
            </Label>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full h-11 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold shadow-lg shadow-orange-600/25 transition-all hover:shadow-orange-600/40"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Phone Number
            </Label>
            <div className="flex gap-2">
              <span className="flex items-center px-3.5 border rounded-xl bg-gray-50 text-sm text-gray-600 font-medium dark:bg-gray-900 dark:border-gray-800 dark:text-gray-400">
                +91
              </span>
              <Input
                id="phone"
                type="tel"
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                maxLength={10}
                required
                disabled={otpSent}
                className="h-11 rounded-xl border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          {otpSent && (
            <div className="space-y-1.5">
              <Label htmlFor="otp" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Enter OTP
              </Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                className="text-center text-lg tracking-[0.3em] h-11 rounded-xl border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100 font-mono"
                required
                autoFocus
              />
            </div>
          )}

          {!otpSent ? (
            <Button
              type="button"
              className="w-full h-11 rounded-xl bg-orange-600 hover:bg-orange-700 font-semibold shadow-lg shadow-orange-600/25"
              onClick={handleSendOtp}
              disabled={sendingOtp}
            >
              {sendingOtp ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending OTP...</>
              ) : (
                <>Send OTP<ArrowRight className="h-4 w-4 ml-2" /></>
              )}
            </Button>
          ) : (
            <div className="space-y-3">
              <Button
                type="submit"
                className="w-full h-11 rounded-xl bg-orange-600 hover:bg-orange-700 font-semibold shadow-lg shadow-orange-600/25"
                disabled={otpLoading}
              >
                {otpLoading ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Verifying...</>
                ) : (
                  <>Verify & Sign In<ArrowRight className="h-4 w-4 ml-2" /></>
                )}
              </Button>
              <button
                type="button"
                className="text-xs text-orange-600 hover:text-orange-700 w-full text-center font-medium transition-colors"
                onClick={() => { setOtpSent(false); setOtp(""); }}
              >
                Change phone number
              </button>
            </div>
          )}
        </form>
      )}

      {/* Footer link */}
      <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        New to Homemade Everything?{" "}
        <Link href="/auth/register" className="text-orange-600 font-semibold hover:text-orange-700 transition-colors">
          Create an account
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-[420px] space-y-4">
        <div className="h-8 w-48 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
        <div className="h-4 w-64 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
        <div className="h-11 w-full rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse mt-8" />
        <div className="h-11 w-full rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
        <div className="h-11 w-full rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse mt-4" />
        <div className="h-11 w-full rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
        <div className="h-11 w-full rounded-xl bg-orange-100 dark:bg-orange-900/30 animate-pulse mt-2" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
