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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PasswordInput } from "@/components/auth/password-input";
import { SocialLogin } from "@/components/auth/social-login";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";
import { Mail, Loader2, Phone, AlertCircle } from "lucide-react";
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
    <Card className="w-full max-w-md shadow-xl border-0 dark:bg-gray-900 dark:border dark:border-gray-800">
      <CardHeader className="text-center space-y-2 pb-4">
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome Back
        </CardTitle>
        <CardDescription className="dark:text-gray-400">
          Sign in to your account to continue
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Auth error from URL params */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-700 text-sm dark:bg-red-950 dark:text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>
              {error === "OAuthAccountNotLinked"
                ? "This email is already linked to another sign-in method."
                : "Authentication failed. Please try again."}
            </span>
          </div>
        )}

        {/* Social Login */}
        <SocialLogin callbackUrl={callbackUrl} label="Sign in" />

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200 dark:border-gray-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-gray-500 dark:bg-gray-900 dark:text-gray-400">
              or
            </span>
          </div>
        </div>

        {/* Login method toggle */}
        <div className="flex rounded-lg border border-gray-200 overflow-hidden dark:border-gray-700">
          <button
            type="button"
            className={`flex-1 py-2.5 text-sm font-medium transition-all ${
              loginMethod === "email"
                ? "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-400"
                : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
            }`}
            onClick={() => setLoginMethod("email")}
          >
            <Mail className="h-4 w-4 inline mr-1.5" /> Email
          </button>
          <button
            type="button"
            className={`flex-1 py-2.5 text-sm font-medium transition-all ${
              loginMethod === "phone"
                ? "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-400"
                : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
            }`}
            onClick={() => setLoginMethod("phone")}
          >
            <Phone className="h-4 w-4 inline mr-1.5" /> Phone OTP
          </button>
        </div>

        {loginMethod === "email" ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
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
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500" role="alert">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="dark:text-gray-300">Password</Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-orange-600 hover:underline font-medium"
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
                <p className="text-xs text-red-500" role="alert">{errors.password.message}</p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={(checked) => setValue("rememberMe", !!checked)}
              />
              <Label htmlFor="rememberMe" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer font-normal">
                Remember me
              </Label>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full h-10 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-medium"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="dark:text-gray-300">Phone Number</Label>
              <div className="flex gap-2">
                <span className="flex items-center px-3 border rounded-lg bg-gray-50 text-sm text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400">
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
                  className="h-10 rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>
            </div>

            {otpSent && (
              <div className="space-y-2">
                <Label htmlFor="otp" className="dark:text-gray-300">Enter OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  maxLength={6}
                  className="text-center text-lg tracking-widest h-10 rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  required
                  autoFocus
                />
              </div>
            )}

            {!otpSent ? (
              <Button
                type="button"
                className="w-full h-10 rounded-lg bg-orange-600 hover:bg-orange-700"
                onClick={handleSendOtp}
                disabled={sendingOtp}
              >
                {sendingOtp ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending...</>
                ) : (
                  "Send OTP"
                )}
              </Button>
            ) : (
              <>
                <Button
                  type="submit"
                  className="w-full h-10 rounded-lg bg-orange-600 hover:bg-orange-700"
                  disabled={otpLoading}
                >
                  {otpLoading ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Verifying...</>
                  ) : (
                    "Verify & Sign In"
                  )}
                </Button>
                <button
                  type="button"
                  className="text-xs text-orange-600 hover:underline w-full text-center"
                  onClick={() => { setOtpSent(false); setOtp(""); }}
                >
                  Change phone number
                </button>
              </>
            )}
          </form>
        )}
      </CardContent>

      <CardFooter className="justify-center pb-6">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="text-orange-600 font-semibold hover:underline">
            Sign Up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-md h-[600px] rounded-xl bg-white/50 dark:bg-gray-900/50 animate-pulse" />
    }>
      <LoginForm />
    </Suspense>
  );
}
