"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Store, Package, ShoppingCart, TrendingUp, BarChart3, Settings, Loader2, Save } from "lucide-react";
import toast from "react-hot-toast";

export default function VendorSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    storeName: "", description: "", phone: "", email: "", address: "",
    city: "", state: "", pincode: "", gstNumber: "", panNumber: "",
    bankName: "", bankAccount: "", bankIfsc: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
    else fetchVendor();
  }, [status]);

  const fetchVendor = async () => {
    try {
      const res = await fetch("/api/vendor/profile");
      if (res.ok) {
        const data = await res.json();
        setVendor(data.vendor);
        setForm({
          storeName: data.vendor.storeName || "",
          description: data.vendor.description || "",
          phone: data.vendor.phone || "",
          email: data.vendor.email || "",
          address: data.vendor.address || "",
          city: data.vendor.city || "",
          state: data.vendor.state || "",
          pincode: data.vendor.pincode || "",
          gstNumber: data.vendor.gstNumber || "",
          panNumber: data.vendor.panNumber || "",
          bankName: data.vendor.bankName || "",
          bankAccount: data.vendor.bankAccount || "",
          bankIfsc: data.vendor.bankIfsc || "",
        });
      }
    } catch {} finally { setLoading(false); }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/vendor/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success("Settings saved");
      } else {
        toast.error("Failed to save");
      }
    } catch {
      toast.error("Something went wrong");
    } finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white p-6 hidden lg:block z-40">
        <div className="flex items-center space-x-2 mb-10">
          <Store className="h-8 w-8 text-orange-500" />
          <span className="text-lg font-bold">Vendor Panel</span>
        </div>
        <nav className="space-y-2">
          {[
            { name: "Dashboard", href: "/vendor/dashboard", icon: BarChart3 },
            { name: "Products", href: "/vendor/products", icon: Package },
            { name: "Orders", href: "/vendor/orders", icon: ShoppingCart },
            { name: "Analytics", href: "/vendor/analytics", icon: TrendingUp },
            { name: "Settings", href: "/vendor/settings", icon: Settings },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href}
                className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition">
                <Icon className="h-5 w-5" /><span className="text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="lg:ml-64 p-6">
        <h1 className="text-2xl font-bold mb-6">Vendor Settings</h1>

        <form onSubmit={handleSave}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Store Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Store Name</Label>
                  <Input value={form.storeName} onChange={(e) => setForm({ ...form, storeName: e.target.value })} required />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Phone</Label>
                    <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Address</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Address</Label>
                  <Textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label>City</Label>
                    <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                  </div>
                  <div>
                    <Label>State</Label>
                    <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
                  </div>
                  <div>
                    <Label>Pincode</Label>
                    <Input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Tax Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>GST Number</Label>
                  <Input value={form.gstNumber} onChange={(e) => setForm({ ...form, gstNumber: e.target.value })} />
                </div>
                <div>
                  <Label>PAN Number</Label>
                  <Input value={form.panNumber} onChange={(e) => setForm({ ...form, panNumber: e.target.value })} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Bank Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Bank Name</Label>
                  <Input value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} />
                </div>
                <div>
                  <Label>Account Number</Label>
                  <Input value={form.bankAccount} onChange={(e) => setForm({ ...form, bankAccount: e.target.value })} />
                </div>
                <div>
                  <Label>IFSC Code</Label>
                  <Input value={form.bankIfsc} onChange={(e) => setForm({ ...form, bankIfsc: e.target.value })} />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 flex justify-end">
            <Button type="submit" className="bg-orange-600 hover:bg-orange-700" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Save className="h-4 w-4 mr-2" /> Save Settings
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
