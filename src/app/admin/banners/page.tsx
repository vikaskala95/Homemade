"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Loader2, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminBannersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", image: "", link: "", sortOrder: 0 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
    else if (session?.user?.role !== "ADMIN") router.push("/");
    else fetchBanners();
  }, [session, status]);

  const fetchBanners = async () => {
    try {
      const res = await fetch("/api/admin/banners");
      const data = await res.json();
      setBanners(data.banners || []);
    } catch {} finally { setLoading(false); }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success("Banner created");
        setShowForm(false);
        setForm({ title: "", image: "", link: "", sortOrder: 0 });
        fetchBanners();
      }
    } catch {
      toast.error("Failed to create banner");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this banner?")) return;
    try {
      await fetch("/api/admin/banners", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      toast.success("Banner deleted");
      fetchBanners();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      await fetch("/api/admin/banners", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !isActive }),
      });
      fetchBanners();
    } catch {}
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="lg:ml-64 p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Banners / CMS</h1>
          <Button onClick={() => setShowForm(!showForm)} className="bg-orange-600 hover:bg-orange-700">
            <Plus className="h-4 w-4 mr-2" /> Add Banner
          </Button>
        </div>

        {showForm && (
          <Card className="mb-6">
            <CardHeader><CardTitle>New Banner</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Title</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                </div>
                <div>
                  <Label>Image URL</Label>
                  <Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} required />
                </div>
                <div>
                  <Label>Link (optional)</Label>
                  <Input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
                </div>
                <div>
                  <Label>Sort Order</Label>
                  <Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="md:col-span-2 flex gap-2">
                  <Button type="submit" className="bg-orange-600 hover:bg-orange-700" disabled={saving}>
                    {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Save
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
            ) : banners.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" /><p>No banners yet</p>
              </div>
            ) : (
              <div className="divide-y">
                {banners.map((banner) => (
                  <div key={banner.id} className="p-4 flex items-center gap-4">
                    <img src={banner.image} alt={banner.title} className="w-24 h-16 object-cover rounded" />
                    <div className="flex-1">
                      <p className="font-medium">{banner.title}</p>
                      {banner.link && <p className="text-xs text-gray-500">{banner.link}</p>}
                    </div>
                    <span className="text-xs text-gray-400">Order: {banner.sortOrder}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleActive(banner.id, banner.isActive)}
                      className={banner.isActive ? "text-green-600" : "text-gray-400"}
                    >
                      {banner.isActive ? "Active" : "Inactive"}
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleDelete(banner.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
