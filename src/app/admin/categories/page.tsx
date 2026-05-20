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
import { Layers, Plus, Pencil, Trash2, Loader2 } from "lucide-react";

export default function AdminCategoriesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", image: "", parentId: "" });

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
    else if (session?.user?.role !== "ADMIN") router.push("/");
    else fetchCategories();
  }, [session, status]);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data.categories || []);
    } catch {} finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          parentId: form.parentId || undefined,
          image: form.image || undefined,
        }),
      });
      if (res.ok) {
        setForm({ name: "", description: "", image: "", parentId: "" });
        setShowForm(false);
        fetchCategories();
      }
    } catch {} finally { setFormLoading(false); }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("Delete this category? This cannot be undone.")) return;
    try {
      await fetch(`/api/admin/categories?id=${id}`, { method: "DELETE" });
      fetchCategories();
    } catch {}
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="lg:ml-64 p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Categories</h1>
          <Button onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ name: "", description: "", image: "", parentId: "" }); }}>
            <Plus className="h-4 w-4 mr-2" />{showForm ? "Cancel" : "Add Category"}
          </Button>
        </div>

        {showForm && (
          <Card className="mb-6">
            <CardHeader><CardTitle>{editing ? "Edit Category" : "New Category"}</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
                  <div>
                    <Label>Parent Category</Label>
                    <select className="w-full px-3 py-2 border rounded-lg text-sm" value={form.parentId} onChange={(e) => setForm({ ...form, parentId: e.target.value })}>
                      <option value="">None (Top Level)</option>
                      {categories.filter((c) => !c.parentId).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <div><Label>Description</Label><Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                <div><Label>Image URL</Label><Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." /></div>
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {editing ? "Update" : "Create"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
            ) : categories.length === 0 ? (
              <div className="text-center py-12 text-gray-500"><Layers className="h-12 w-12 mx-auto mb-3 text-gray-300" /><p>No categories yet</p></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b text-left text-gray-500 bg-gray-50">
                    <th className="p-4 font-medium">Name</th>
                    <th className="p-4 font-medium">Description</th>
                    <th className="p-4 font-medium">Products</th>
                    <th className="p-4 font-medium">Sub-categories</th>
                    <th className="p-4 font-medium">Actions</th>
                  </tr></thead>
                  <tbody>
                    {categories.filter((c) => !c.parentId).map((cat: any) => (
                      <>
                        <tr key={cat.id} className="border-b">
                          <td className="p-4 font-medium">{cat.name}</td>
                          <td className="p-4 text-gray-500 max-w-[200px] truncate">{cat.description || "—"}</td>
                          <td className="p-4">{cat._count?.products || 0}</td>
                          <td className="p-4">{cat.children?.length || 0}</td>
                          <td className="p-4">
                            <Button size="sm" variant="ghost" className="text-red-500" onClick={() => deleteCategory(cat.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                        {cat.children?.map((child: any) => (
                          <tr key={child.id} className="border-b bg-gray-50/50">
                            <td className="p-4 pl-8 text-gray-600">↳ {child.name}</td>
                            <td className="p-4 text-gray-400 max-w-[200px] truncate">{child.description || "—"}</td>
                            <td className="p-4">{child._count?.products || 0}</td>
                            <td className="p-4">—</td>
                            <td className="p-4">
                              <Button size="sm" variant="ghost" className="text-red-500" onClick={() => deleteCategory(child.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </>
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
