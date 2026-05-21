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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PasswordInput } from "@/components/auth/password-input";
import { PasswordStrength } from "@/components/auth/password-strength";
import { SocialLogin } from "@/components/auth/social-login";
import { registerSchema, type RegisterFormData } from "@/lib/validations/auth";
import { Mail, User, Phone, Loader2, ShoppingBag, Store, Truck } from "lucide-react";
import toast from "react-hot-toast";

const roleOptions = [
  { value: "CUSTOMER" as const, label: "Buyer", icon: ShoppingBag, desc: "Browse & buy products" },
  { value: "VENDOR" as const, label: "Seller", icon: Store, desc: "Sell your products" },
  { value: "DELIVERY" as const, label: "Delivery Partner", icon: Truck, desc: "Deliver orders" },
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
    <Card className="w-full max-w-md shadow-xl border-0 dark:bg-gray-900 dark:border dark:border-gray-800">
      <CardHeader className="text-center space-y-2 pb-4">
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
          Create Account
        </CardTitle>
        <CardDescription className="dark:text-gray-400">
          Join the homemade marketplace
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Social Login */}
        <SocialLogin callbackUrl="/dashboard" label="Sign up" />

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200 dark:border-gray-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-gray-500 dark:bg-gray-900 dark:text-gray-400">
              or register with email
            </span>
          </div>
        </div>

        {/* Server Error */}
        {serverError && (
          <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm dark:bg-red-950 dark:text-red-400">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="dark:text-gray-300">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <Input
                id="name"
                placeholder="John Doe"
                {...register("name")}
                className="pl-10 h-10 rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                autoComplete="name"
                aria-invalid={!!errors.name}
              />
            </div>
            {errors.name && (
              <p className="text-xs text-red-500" role="alert">{errors.name.message}</p>
            )}
          </div>

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

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="dark:text-gray-300">
              Mobile Number <span className="text-gray-400 font-normal">(optional)</span>
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <Input
                id="phone"
                type="tel"
                placeholder="9876543210"
                {...register("phone")}
                className="pl-10 h-10 rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                autoComplete="tel"
              />
            </div>
            {errors.phone && (
              <p className="text-xs text-red-500" role="alert">{errors.phone.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="dark:text-gray-300">Password</Label>
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
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="dark:text-gray-300">Confirm Password</Label>
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
            <Label className="dark:text-gray-300">I want to join as</Label>
            <div className="grid grid-cols-3 gap-2">
              {roleOptions.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.value;
                return (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setValue("role", role.value)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all text-center ${
                      isSelected
                        ? "border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-400 dark:border-orange-600"
                        : "border-gray-200 hover:border-gray-300 text-gray-600 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-600"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-medium">{role.label}</span>
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
            className="w-full h-10 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-medium"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center pb-6">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-orange-600 font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
