"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, Mail, Lock, Eye, EyeOff, Phone, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Phone OTP state
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid email or password");
      } else {
        toast.success("Welcome back!");
        router.push("/");
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/" });
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
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });
      if (res.ok) {
        // Sign in with credentials using the phone-verified user
        const data = await res.json();
        toast.success("Phone verified! Signing in...");
        // Auto-sign in using the verified user's email
        if (data.user) {
          const result = await signIn("credentials", {
            email: `${phone}@phone.homemade.local`,
            password: "", // no password for OTP users
            redirect: false,
          });
          if (!result?.error) {
            router.push("/");
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
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="inline-flex items-center justify-center space-x-2 mb-4">
            <Store className="h-8 w-8 text-orange-600" />
            <span className="text-xl font-bold">
              Homemade<span className="text-orange-600">Everything</span>
            </span>
          </Link>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Google Sign In */}
          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            type="button"
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">or</span>
            </div>
          </div>

          {/* Login method toggle */}
          <div className="flex rounded-lg border overflow-hidden">
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                loginMethod === "email" ? "bg-orange-50 text-orange-700" : "text-gray-500 hover:bg-gray-50"
              }`}
              onClick={() => setLoginMethod("email")}
            >
              <Mail className="h-4 w-4 inline mr-1" /> Email
            </button>
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                loginMethod === "phone" ? "bg-orange-50 text-orange-700" : "text-gray-500 hover:bg-gray-50"
              }`}
              onClick={() => setLoginMethod("phone")}
            >
              <Phone className="h-4 w-4 inline mr-1" /> Phone OTP
            </button>
          </div>

          {loginMethod === "email" ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/auth/forgot-password" className="text-xs text-orange-600 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex gap-2">
                  <span className="flex items-center px-3 border rounded-md bg-gray-50 text-sm text-gray-600">+91</span>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    maxLength={10}
                    required
                    disabled={otpSent}
                  />
                </div>
              </div>

              {otpSent && (
                <div className="space-y-2">
                  <Label htmlFor="otp">Enter OTP</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    maxLength={6}
                    className="text-center text-lg tracking-widest"
                    required
                  />
                </div>
              )}

              {!otpSent ? (
                <Button type="button" className="w-full" onClick={handleSendOtp} disabled={sendingOtp}>
                  {sendingOtp ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending...</> : "Send OTP"}
                </Button>
              ) : (
                <>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Verifying..." : "Verify & Sign In"}
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

        <CardFooter className="justify-center">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="text-orange-600 font-medium hover:underline">
              Sign Up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
