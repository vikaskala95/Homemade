"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Ticket, Plus, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function VendorCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    code: "",
    type: "PERCENTAGE",
    value: "",
    minOrder: "",
    maxDiscount: "",
    usageLimit: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await fetch("/api/vendor/coupons");
      if (res.ok) {
        const data = await res.json();
        setCoupons(data.coupons || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code.toUpperCase(),
          type: form.type,
          value: parseFloat(form.value),
          minOrder: form.minOrder ? parseFloat(form.minOrder) : undefined,
          maxDiscount: form.maxDiscount ? parseFloat(form.maxDiscount) : undefined,
          usageLimit: form.usageLimit ? parseInt(form.usageLimit) : undefined,
          startDate: new Date(form.startDate).toISOString(),
          endDate: new Date(form.endDate).toISOString(),
        }),
      });
      if (res.ok) {
        toast.success("Coupon created");
        setShowForm(false);
        setForm({ code: "", type: "PERCENTAGE", value: "", minOrder: "", maxDiscount: "", usageLimit: "", startDate: new Date().toISOString().split("T")[0], endDate: "" });
        fetchCoupons();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to create coupon");
      }
    } catch {
      toast.error("Error creating coupon");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/vendor/dashboard" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">My Coupons</h1>
          <div className="ml-auto">
            <Button onClick={() => setShowForm(!showForm)} className="bg-orange-600 hover:bg-orange-700">
              <Plus className="h-4 w-4 mr-2" /> Create Coupon
            </Button>
          </div>
        </div>

        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">New Coupon</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Code</Label>
                  <Input placeholder="e.g. VENDOR20" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
                </div>
                <div>
                  <Label>Type</Label>
                  <select className="w-full h-9 rounded-md border px-3 text-sm" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <Label>Value</Label>
                  <Input type="number" placeholder={form.type === "PERCENTAGE" ? "e.g. 10" : "e.g. 100"} value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} required />
                </div>
                <div>
                  <Label>Min Order (₹)</Label>
                  <Input type="number" placeholder="Optional" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: e.target.value })} />
                </div>
                <div>
                  <Label>Max Discount (₹)</Label>
                  <Input type="number" placeholder="Optional" value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })} />
                </div>
                <div>
                  <Label>Usage Limit</Label>
                  <Input type="number" placeholder="Unlimited" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} />
                </div>
                <div>
                  <Label>Start Date</Label>
                  <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
                </div>
                <div className="md:col-span-2 flex gap-2">
                  <Button type="submit" disabled={creating} className="bg-orange-600 hover:bg-orange-700">
                    {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Create
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Ticket className="h-5 w-5" /> Your Coupons
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-orange-600" /></div>
            ) : coupons.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No coupons created yet. Create one to attract more customers!</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2">Code</th>
                      <th className="text-left py-3 px-2">Discount</th>
                      <th className="text-left py-3 px-2">Used</th>
                      <th className="text-left py-3 px-2">Valid Until</th>
                      <th className="text-left py-3 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map((c: any) => (
                      <tr key={c.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-2 font-mono font-bold">{c.code}</td>
                        <td className="py-3 px-2">{c.type === "PERCENTAGE" ? `${c.value}%` : `₹${c.value}`}</td>
                        <td className="py-3 px-2">{c.usedCount}/{c.usageLimit || "∞"}</td>
                        <td className="py-3 px-2">{new Date(c.endDate).toLocaleDateString("en-IN")}</td>
                        <td className="py-3 px-2">
                          <Badge className={c.isActive && new Date(c.endDate) > new Date() ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                            {c.isActive && new Date(c.endDate) > new Date() ? "Active" : "Expired"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
