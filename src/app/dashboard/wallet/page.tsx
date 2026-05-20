"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, ArrowUpRight, ArrowDownLeft, Loader2 } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function WalletPage() {
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/wallet")
      .then((r) => r.json())
      .then((data) => setWallet(data.wallet))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">My Wallet</h1>

          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-orange-600" /></div>
          ) : (
            <>
              <Card className="mb-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Wallet className="h-8 w-8" />
                    <div>
                      <p className="text-sm opacity-80">Available Balance</p>
                      <p className="text-3xl font-bold">₹{(wallet?.balance || 0).toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Transaction History</CardTitle>
                </CardHeader>
                <CardContent>
                  {!wallet?.transactions?.length ? (
                    <p className="text-gray-500 text-center py-6">No transactions yet</p>
                  ) : (
                    <div className="space-y-3">
                      {wallet.transactions.map((txn: any) => (
                        <div key={txn.id} className="flex items-center justify-between py-3 border-b last:border-0">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${txn.type === "CREDIT" ? "bg-green-100" : "bg-red-100"}`}>
                              {txn.type === "CREDIT" ? (
                                <ArrowDownLeft className="h-4 w-4 text-green-600" />
                              ) : (
                                <ArrowUpRight className="h-4 w-4 text-red-600" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{txn.description}</p>
                              <p className="text-xs text-gray-500">{new Date(txn.createdAt).toLocaleDateString("en-IN")}</p>
                            </div>
                          </div>
                          <span className={`font-semibold ${txn.type === "CREDIT" ? "text-green-600" : "text-red-600"}`}>
                            {txn.type === "CREDIT" ? "+" : "-"}₹{txn.amount.toLocaleString("en-IN")}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
