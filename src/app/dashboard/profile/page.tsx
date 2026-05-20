"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, User } from "lucide-react";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
  });

  useEffect(() => {
    if (session?.user) {
      setForm({ name: session.user.name || "", email: session.user.email || "" });
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name }),
      });
      if (res.ok) {
        setMessage("Profile updated successfully");
        update({ name: form.name });
      } else {
        setMessage("Failed to update profile");
      }
    } catch {
      setMessage("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">My Profile</h1>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" />Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={form.email} disabled className="bg-gray-50" />
                  <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                </div>
                {message && <p className={`text-sm ${message.includes("success") ? "text-green-600" : "text-red-600"}`}>{message}</p>}
                <Button type="submit" disabled={loading}>
                  {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
