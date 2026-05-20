"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MapPin, Plus, Trash2, Star, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export default function AddressesPage() {
  const { data: session } = useSession();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "", city: "", state: "", pincode: "" });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const res = await fetch("/api/addresses");
      if (res.ok) {
        const data = await res.json();
        setAddresses(data.addresses || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success("Address added");
        setShowForm(false);
        setForm({ name: "", phone: "", address: "", city: "", state: "", pincode: "" });
        fetchAddresses();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to add address");
      }
    } catch {
      toast.error("Error saving address");
    } finally {
      setSaving(false);
    }
  };

  const deleteAddress = async (id: string) => {
    try {
      const res = await fetch(`/api/addresses?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Address deleted");
        fetchAddresses();
      }
    } catch {
      toast.error("Failed to delete");
    }
  };

  const setDefault = async (id: string) => {
    try {
      await fetch("/api/addresses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addressId: id, isDefault: true }),
      });
      toast.success("Default address updated");
      fetchAddresses();
    } catch {
      toast.error("Failed to update");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">My Addresses</h1>
            <Button onClick={() => setShowForm(!showForm)} className="bg-orange-600 hover:bg-orange-700">
              <Plus className="h-4 w-4 mr-2" /> Add Address
            </Button>
          </div>

          {showForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">New Address</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Full Name</Label>
                      <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <Label>Address</Label>
                    <Input required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>City</Label>
                      <Input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                    </div>
                    <div>
                      <Label>State</Label>
                      <Input required value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
                    </div>
                    <div>
                      <Label>Pincode</Label>
                      <Input required value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={saving} className="bg-orange-600 hover:bg-orange-700">
                      {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Save
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-orange-600" /></div>
          ) : addresses.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No addresses saved yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {addresses.map((addr) => (
                <Card key={addr.id}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">{addr.name}</p>
                          {addr.isDefault && <Badge className="bg-orange-100 text-orange-700">Default</Badge>}
                        </div>
                        <p className="text-sm text-gray-600">{addr.address}</p>
                        <p className="text-sm text-gray-600">{addr.city}, {addr.state} - {addr.pincode}</p>
                        <p className="text-sm text-gray-500 mt-1">Phone: {addr.phone}</p>
                      </div>
                      <div className="flex gap-2">
                        {!addr.isDefault && (
                          <Button size="sm" variant="outline" onClick={() => setDefault(addr.id)}>
                            <Star className="h-3 w-3 mr-1" /> Set Default
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => deleteAddress(addr.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
