"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function VendorRegisterPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    storeName: "",
    description: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    gstNumber: "",
    panNumber: "",
    bankName: "",
    bankAccount: "",
    bankIfsc: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      toast.error("Please login first");
      router.push("/auth/login");
      return;
    }

    if (!formData.storeName || !formData.phone) {
      toast.error("Store name and phone are required");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/vendor/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Application submitted! Awaiting admin approval.");
        router.push("/vendor/dashboard");
      } else {
        toast.error(data.error || "Registration failed");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-8">
            <Store className="h-12 w-12 text-orange-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900">Become a Vendor</h1>
            <p className="text-gray-600 mt-2">Start selling your homemade products today</p>
          </div>

          <form onSubmit={handleSubmit}>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Store Information</CardTitle>
                <CardDescription>Tell us about your store</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="storeName">Store Name *</Label>
                  <Input id="storeName" name="storeName" value={formData.storeName} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Store Description</Label>
                  <Textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" name="address" value={formData.address} onChange={handleChange} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" name="city" value={formData.city} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" name="state" value={formData.state} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input id="pincode" name="pincode" value={formData.pincode} onChange={handleChange} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Business Details (Optional)</CardTitle>
                <CardDescription>Required for GST invoicing and payouts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gstNumber">GST Number</Label>
                    <Input id="gstNumber" name="gstNumber" value={formData.gstNumber} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="panNumber">PAN Number</Label>
                    <Input id="panNumber" name="panNumber" value={formData.panNumber} onChange={handleChange} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input id="bankName" name="bankName" value={formData.bankName} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bankAccount">Account Number</Label>
                    <Input id="bankAccount" name="bankAccount" value={formData.bankAccount} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bankIfsc">IFSC Code</Label>
                    <Input id="bankIfsc" name="bankIfsc" value={formData.bankIfsc} onChange={handleChange} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? (
                <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Submitting...</>
              ) : (
                "Submit Application"
              )}
            </Button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
