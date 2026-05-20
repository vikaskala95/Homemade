"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  TrendingUp,
  Settings,
  DollarSign,
  Wallet,
  ArrowUpRight,
  Clock,
  CheckCircle,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

const vendorLinks = [
  { href: "/vendor/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/vendor/products", label: "Products", icon: Package },
  { href: "/vendor/orders", label: "Orders", icon: ShoppingCart },
  { href: "/vendor/analytics", label: "Analytics", icon: TrendingUp },
  { href: "/vendor/payouts", label: "Payouts", icon: DollarSign },
  { href: "/vendor/settings", label: "Settings", icon: Settings },
];

export default function VendorPayoutsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [payouts, setPayouts] = useState<any[]>([]);
  const [balance, setBalance] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    if (session && session.user?.role !== "VENDOR" && session.user?.role !== "ADMIN") {
      router.push("/");
    }
    fetchPayouts();
  }, [session]);

  const fetchPayouts = async () => {
    try {
      const res = await fetch("/api/vendor/payouts");
      if (res.ok) {
        const data = await res.json();
        setPayouts(data.payouts);
        setBalance(data.balance);
      }
    } catch {
      toast.error("Failed to load payouts");
    } finally {
      setLoading(false);
    }
  };

  const requestPayout = async () => {
    const num = parseFloat(amount);
    if (!num || num < 100) {
      toast.error("Minimum payout is ₹100");
      return;
    }
    setRequesting(true);
    try {
      const res = await fetch("/api/vendor/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: num }),
      });
      if (res.ok) {
        toast.success("Payout requested!");
        setAmount("");
        fetchPayouts();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to request payout");
      }
    } catch {
      toast.error("Error requesting payout");
    } finally {
      setRequesting(false);
    }
  };

  const statusColor = (s: string) => {
    switch (s) {
      case "COMPLETED": return "bg-green-100 text-green-800";
      case "PROCESSING": return "bg-blue-100 text-blue-800";
      case "PENDING": return "bg-yellow-100 text-yellow-800";
      case "REJECTED": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 p-4 hidden lg:block z-40">
        <Link href="/" className="text-xl font-bold text-orange-600 mb-8 block">
          Vendor Panel
        </Link>
        <nav className="space-y-1">
          {vendorLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                link.href === "/vendor/payouts"
                  ? "bg-orange-50 text-orange-700 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="lg:ml-64 p-6">
        <h1 className="text-2xl font-bold mb-6">Payouts</h1>

        {balance && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <ArrowUpRight className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-500">Total Earnings</p>
                    <p className="text-xl font-bold">₹{balance.totalEarnings.toLocaleString("en-IN")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">Paid Out</p>
                    <p className="text-xl font-bold">₹{balance.totalPaidOut.toLocaleString("en-IN")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="text-xs text-gray-500">Pending</p>
                    <p className="text-xl font-bold">₹{balance.pendingPayouts.toLocaleString("en-IN")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-xs text-gray-500">Available</p>
                    <p className="text-xl font-bold text-orange-600">₹{balance.available.toLocaleString("en-IN")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Request Payout</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="text-sm text-gray-600 block mb-1">Amount (₹)</label>
                <Input
                  type="number"
                  placeholder="Min ₹100"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min={100}
                  max={balance?.available || 0}
                />
              </div>
              <Button
                onClick={requestPayout}
                disabled={requesting}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {requesting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Request
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payout History</CardTitle>
          </CardHeader>
          <CardContent>
            {payouts.length === 0 ? (
              <p className="text-gray-500 text-sm">No payouts yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2">Date</th>
                      <th className="text-left py-3 px-2">Amount</th>
                      <th className="text-left py-3 px-2">Status</th>
                      <th className="text-left py-3 px-2">Transaction ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payouts.map((p: any) => (
                      <tr key={p.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-2">{new Date(p.createdAt).toLocaleDateString("en-IN")}</td>
                        <td className="py-3 px-2 font-medium">₹{p.amount.toLocaleString("en-IN")}</td>
                        <td className="py-3 px-2">
                          <Badge className={statusColor(p.status)}>{p.status}</Badge>
                        </td>
                        <td className="py-3 px-2 text-gray-500">{p.transactionId || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
