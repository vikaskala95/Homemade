"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Settings, Shield, Bell, LogOut, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promotions, setPromotions] = useState(false);

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? "bg-orange-500" : "bg-gray-300"
      }`}
      onClick={onChange}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        checked ? "translate-x-6" : "translate-x-1"
      }`} />
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Account Settings</h1>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Bell className="h-5 w-5" /> Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-xs text-gray-500">Receive emails about your account activity</p>
                  </div>
                  <Toggle checked={emailNotifications} onChange={() => setEmailNotifications(!emailNotifications)} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Order Updates</Label>
                    <p className="text-xs text-gray-500">Get notified when your order status changes</p>
                  </div>
                  <Toggle checked={orderUpdates} onChange={() => setOrderUpdates(!orderUpdates)} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Promotional Emails</Label>
                    <p className="text-xs text-gray-500">Receive deals and offers from sellers</p>
                  </div>
                  <Toggle checked={promotions} onChange={() => setPromotions(!promotions)} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="h-5 w-5" /> Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Change Password</p>
                    <p className="text-xs text-gray-500">Update your account password</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => window.location.href = "/auth/forgot-password"}>
                    Change
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Login Sessions</p>
                    <p className="text-xs text-gray-500">Manage your active sessions</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => { signOut(); toast.success("All sessions ended"); }}>
                    Sign Out All
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-red-600">
                  <Trash2 className="h-5 w-5" /> Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Delete Account</p>
                    <p className="text-xs text-gray-500">Permanently delete your account and all data</p>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => toast.error("Please contact support to delete your account")}>
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
