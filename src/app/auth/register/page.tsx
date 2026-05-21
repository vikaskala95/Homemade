"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/auth/password-input";
import { PasswordStrength } from "@/components/auth/password-strength";
import { SocialLogin } from "@/components/auth/social-login";
import { registerSchema, type RegisterFormData } from "@/lib/validations/auth";
import { Mail, User, Phone, Loader2, ShoppingBag, Store, Truck, ArrowRight, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

const roleOptions = [
  { value: "CUSTOMER" as const, label: "Buyer", icon: ShoppingBag, desc: "Browse & buy" },
  { value: "VENDOR" as const, label: "Seller", icon: Store, desc: "Sell products" },
  { value: "DELIVERY" as const, label: "Delivery", icon: Truck, desc: "Deliver orders" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      role: "CUSTOMER",
    },
  });

  const password = watch("password");
  const selectedRole = watch("role");

  const onSubmit = async (data: RegisterFormData) => {
    setServerError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone || undefined,
          password: data.password,
          confirmPassword: data.confirmPassword,
          role: data.role,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setServerError(result.error || "Registration failed");
        toast.error(result.error || "Registration failed");
        return;
      }

      toast.success("Account created! Signing in...");

      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        router.push("/auth/login");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="w-full max-w-[420px]">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Create your account
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Join thousands of artisans & buyers on Homemade Everything
        </p>
      </div>

      {/* Social Login */}
      <SocialLogin callbackUrl="/dashboard" label="Sign up" />

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-gray-800" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 text-gray-400 dark:bg-gray-950 dark:text-gray-500 font-medium">
            or register with email
          </span>
        </div>
      </div>

      {/* Server Error */}
      {serverError && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-50 text-red-700 text-sm mb-5 dark:bg-red-950/50 dark:text-red-400 border border-red-100 dark:border-red-900/50">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Full Name
          </Label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <Input
              id="name"
              placeholder="John Doe"
              {...register("name")}
              className="pl-10 h-11 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100"
              autoComplete="name"
              aria-invalid={!!errors.name}
            />
          </div>
          {errors.name && (
            <p className="text-xs text-red-500" role="alert">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Email
          </Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register("email")}
              className="pl-10 h-11 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100"
              autoComplete="email"
              aria-invalid={!!errors.email}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-red-500" role="alert">{errors.email.message}</p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Mobile Number <span className="text-gray-400 font-normal">(optional)</span>
          </Label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <Input
              id="phone"
              type="tel"
              placeholder="9876543210"
              {...register("phone")}
              className="pl-10 h-11 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100"
              autoComplete="tel"
            />
          </div>
          {errors.phone && (
            <p className="text-xs text-red-500" role="alert">{errors.phone.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Password
          </Label>
          <PasswordInput
            id="password"
            placeholder="Min. 8 characters"
            {...register("password")}
            autoComplete="new-password"
            aria-invalid={!!errors.password}
          />
          <PasswordStrength password={password} />
          {errors.password && (
            <p className="text-xs text-red-500" role="alert">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Confirm Password
          </Label>
          <PasswordInput
            id="confirmPassword"
            placeholder="Repeat password"
            showIcon={false}
            {...register("confirmPassword")}
            autoComplete="new-password"
            aria-invalid={!!errors.confirmPassword}
            className="pl-3"
          />
          {errors.confirmPassword && (
            <p className="text-xs text-red-500" role="alert">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Role Selection */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">I want to join as</Label>
          <div className="grid grid-cols-3 gap-2.5">
            {roleOptions.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.value;
              return (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => setValue("role", role.value)}
                  className={`flex flex-col items-center gap-1.5 p-3.5 rounded-xl border-2 transition-all text-center ${
                    isSelected
                      ? "border-orange-500 bg-orange-50 text-orange-700 shadow-sm dark:bg-orange-950/50 dark:text-orange-400 dark:border-orange-600"
                      : "border-gray-200 hover:border-gray-300 text-gray-500 dark:border-gray-800 dark:text-gray-400 dark:hover:border-gray-700"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    isSelected
                      ? "bg-orange-100 dark:bg-orange-900/50"
                      : "bg-gray-100 dark:bg-gray-800"
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-semibold">{role.label}</span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 leading-tight">{role.desc}</span>
                </button>
              );
            })}
          </div>
          {errors.role && (
            <p className="text-xs text-red-500" role="alert">{errors.role.message}</p>
          )}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          className="w-full h-11 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold shadow-lg shadow-orange-600/25 transition-all hover:shadow-orange-600/40 mt-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating account...
            </>
          ) : (
            <>
              Create Account
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </form>

      {/* Footer link */}
      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-orange-600 font-semibold hover:text-orange-700 transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}
