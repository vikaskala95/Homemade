"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, X, Loader2 } from "lucide-react";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [imageUrl, setImageUrl] = useState("");
  const [form, setForm] = useState({
    name: "", description: "", shortDesc: "", categoryId: "",
    price: "", comparePrice: "", stock: "", minOrder: "1", maxOrder: "",
    weight: "", unit: "piece", images: [] as string[], tags: [] as string[],
    isOrganic: false, metaTitle: "", metaDesc: "",
  });
  const [tagInput, setTagInput] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch(`/api/vendor/products`).then((r) => r.json()),
    ]).then(([catData, prodData]) => {
      setCategories(catData.categories || []);
      const product = (prodData.products || []).find((p: any) => p.id === productId);
      if (product) {
        setForm({
          name: product.name, description: product.description,
          shortDesc: product.shortDesc || "", categoryId: product.categoryId,
          price: String(product.price), comparePrice: product.comparePrice ? String(product.comparePrice) : "",
          stock: String(product.stock), minOrder: String(product.minOrder || 1),
          maxOrder: product.maxOrder ? String(product.maxOrder) : "",
          weight: product.weight ? String(product.weight) : "", unit: product.unit || "piece",
          images: product.images || [], tags: product.tags || [],
          isOrganic: product.isOrganic || false, metaTitle: product.metaTitle || "",
          metaDesc: product.metaDesc || "",
        });
      }
      setFetching(false);
    }).catch(() => setFetching(false));
  }, [productId]);

  const addImage = () => {
    if (imageUrl.trim() && form.images.length < 8) {
      setForm({ ...form, images: [...form.images, imageUrl.trim()] });
      setImageUrl("");
    }
  };

  const removeImage = (idx: number) => {
    setForm({ ...form, images: form.images.filter((_, i) => i !== idx) });
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !form.tags.includes(tag)) {
      setForm({ ...form, tags: [...form.tags, tag] });
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setForm({ ...form, tags: form.tags.filter((t) => t !== tag) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = {
        productId,
        name: form.name, description: form.description,
        shortDesc: form.shortDesc || undefined, categoryId: form.categoryId,
        price: parseFloat(form.price),
        comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : undefined,
        stock: parseInt(form.stock), minOrder: parseInt(form.minOrder) || 1,
        maxOrder: form.maxOrder ? parseInt(form.maxOrder) : undefined,
        weight: form.weight ? parseFloat(form.weight) : undefined,
        unit: form.unit, images: form.images, tags: form.tags,
        isOrganic: form.isOrganic, metaTitle: form.metaTitle || undefined,
        metaDesc: form.metaDesc || undefined,
      };
      const res = await fetch("/api/vendor/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");
      router.push("/vendor/products");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-orange-600" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/vendor/products"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" />Back</Button></Link>
          <h1 className="text-2xl font-bold">Edit Product</h1>
        </div>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label>Product Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
              <div><Label>Short Description</Label><Input value={form.shortDesc} onChange={(e) => setForm({ ...form, shortDesc: e.target.value })} /></div>
              <div><Label>Description *</Label><Textarea rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /></div>
              <div>
                <Label>Category *</Label>
                <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} required>
                  <option value="">Select</option>
                  {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={form.isOrganic} onChange={(e) => setForm({ ...form, isOrganic: e.target.checked })} className="rounded" />
                <Label>Organic product</Label>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Pricing & Inventory</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Selling Price (₹) *</Label><Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required /></div>
                <div><Label>Compare Price (₹)</Label><Input type="number" step="0.01" value={form.comparePrice} onChange={(e) => setForm({ ...form, comparePrice: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label>Stock *</Label><Input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required /></div>
                <div><Label>Min Order</Label><Input type="number" min="1" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: e.target.value })} /></div>
                <div><Label>Max Order</Label><Input type="number" min="1" value={form.maxOrder} onChange={(e) => setForm({ ...form, maxOrder: e.target.value })} /></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Images</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Image URL" />
                <Button type="button" variant="outline" onClick={addImage}><Plus className="h-4 w-4" /></Button>
              </div>
              {form.images.length > 0 && (
                <div className="grid grid-cols-4 gap-3">
                  {form.images.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img src={img} alt="" className="w-full h-24 object-cover rounded-lg border" />
                      <button type="button" onClick={() => removeImage(idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"><X className="h-3.5 w-3.5" /></button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Tags</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="Add tag" onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())} />
                <Button type="button" variant="outline" onClick={addTag}>Add</Button>
              </div>
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm">{tag}<button type="button" onClick={() => removeTag(tag)}><X className="h-3 w-3" /></button></span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <div className="flex justify-end gap-3">
            <Link href="/vendor/products"><Button variant="outline" type="button">Cancel</Button></Link>
            <Button type="submit" disabled={loading}>
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
