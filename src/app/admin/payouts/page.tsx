"use client";

import { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DollarSign, Check, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [transactionIds, setTransactionIds] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchPayouts();
  }, [statusFilter]);

  const fetchPayouts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/payouts?status=${statusFilter}`);
      if (res.ok) {
        const data = await res.json();
        setPayouts(data.payouts);
      }
    } catch {
      toast.error("Failed to load payouts");
    } finally {
      setLoading(false);
    }
  };

  const processPayout = async (payoutId: string, status: string) => {
    setProcessingId(payoutId);
    try {
      const res = await fetch("/api/admin/payouts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payoutId,
          status,
          transactionId: transactionIds[payoutId] || undefined,
        }),
      });
      if (res.ok) {
        toast.success(`Payout ${status.toLowerCase()}`);
        fetchPayouts();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to process");
      }
    } catch {
      toast.error("Error processing payout");
    } finally {
      setProcessingId(null);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="lg:ml-64 p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Vendor Payouts</h1>
          <div className="flex gap-2">
            {["PENDING", "PROCESSING", "COMPLETED", "REJECTED"].map((s) => (
              <Button
                key={s}
                variant={statusFilter === s ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(s)}
                className={statusFilter === s ? "bg-orange-600 hover:bg-orange-700" : ""}
              >
                {s}
              </Button>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="h-5 w-5" /> Payouts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
              </div>
            ) : payouts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No {statusFilter.toLowerCase()} payouts</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2">Vendor</th>
                      <th className="text-left py-3 px-2">Amount</th>
                      <th className="text-left py-3 px-2">Date</th>
                      <th className="text-left py-3 px-2">Status</th>
                      {statusFilter === "PENDING" && <th className="text-left py-3 px-2">Transaction ID</th>}
                      <th className="text-left py-3 px-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payouts.map((p: any) => (
                      <tr key={p.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-2">
                          <p className="font-medium">{p.vendor?.storeName}</p>
                          <p className="text-xs text-gray-500">{p.vendor?.user?.email}</p>
                        </td>
                        <td className="py-3 px-2 font-bold">₹{p.amount.toLocaleString("en-IN")}</td>
                        <td className="py-3 px-2">{new Date(p.createdAt).toLocaleDateString("en-IN")}</td>
                        <td className="py-3 px-2">
                          <Badge className={statusColor(p.status)}>{p.status}</Badge>
                        </td>
                        {statusFilter === "PENDING" && (
                          <td className="py-3 px-2">
                            <Input
                              placeholder="Enter txn ID"
                              className="w-40"
                              value={transactionIds[p.id] || ""}
                              onChange={(e) => setTransactionIds({ ...transactionIds, [p.id]: e.target.value })}
                            />
                          </td>
                        )}
                        <td className="py-3 px-2">
                          {(statusFilter === "PENDING" || statusFilter === "PROCESSING") && (
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 h-8"
                                onClick={() => processPayout(p.id, "COMPLETED")}
                                disabled={processingId === p.id}
                              >
                                {processingId === p.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-8"
                                onClick={() => processPayout(p.id, "REJECTED")}
                                disabled={processingId === p.id}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                          {p.transactionId && (
                            <span className="text-xs text-gray-500">Txn: {p.transactionId}</span>
                          )}
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
