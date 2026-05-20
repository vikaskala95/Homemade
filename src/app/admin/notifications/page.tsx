"use client";

import { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bell, Send, Users, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminNotificationsPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    message: "",
    target: "ALL", // ALL, VENDORS, CUSTOMERS
  });

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(`Notification sent to ${data.count} users`);
        setForm({ title: "", message: "", target: "ALL" });
      } else {
        toast.error("Failed to send notification");
      }
    } catch {
      toast.error("Error sending notification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="lg:ml-64 p-6">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Bell className="h-6 w-6" /> Notification Center
        </h1>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="text-lg">Send Broadcast Notification</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <Label>Target Audience</Label>
                <select
                  className="w-full h-9 rounded-md border px-3 text-sm mt-1"
                  value={form.target}
                  onChange={(e) => setForm({ ...form, target: e.target.value })}
                >
                  <option value="ALL">All Users</option>
                  <option value="VENDORS">Vendors Only</option>
                  <option value="CUSTOMERS">Customers Only</option>
                </select>
              </div>
              <div>
                <Label>Title</Label>
                <Input
                  placeholder="Notification title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Message</Label>
                <textarea
                  className="w-full min-h-[100px] rounded-md border px-3 py-2 text-sm resize-y"
                  placeholder="Write your notification message..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" disabled={loading} className="bg-orange-600 hover:bg-orange-700">
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                Send Notification
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
