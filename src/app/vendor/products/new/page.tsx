"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, X, Loader2, Upload } from "lucide-react";

export default function NewProductPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    shortDesc: "",
    categoryId: "",
    price: "",
    comparePrice: "",
    stock: "",
    minOrder: "1",
    maxOrder: "",
    weight: "",
    unit: "piece",
    images: [] as string[],
    tags: [] as string[],
    isOrganic: false,
    metaTitle: "",
    metaDesc: "",
  });
  const [tagInput, setTagInput] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .catch(() => {});
  }, []);

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
    if (tag && !form.tags.includes(tag) && form.tags.length < 10) {
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
        name: form.name,
        description: form.description,
        shortDesc: form.shortDesc || undefined,
        categoryId: form.categoryId,
        price: parseFloat(form.price),
        comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : undefined,
        stock: parseInt(form.stock),
        minOrder: parseInt(form.minOrder) || 1,
        maxOrder: form.maxOrder ? parseInt(form.maxOrder) : undefined,
        weight: form.weight ? parseFloat(form.weight) : undefined,
        unit: form.unit,
        images: form.images,
        tags: form.tags,
        isOrganic: form.isOrganic,
        metaTitle: form.metaTitle || undefined,
        metaDesc: form.metaDesc || undefined,
      };

      const res = await fetch("/api/vendor/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create product");

      router.push("/vendor/products");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/vendor/dashboard">
            <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>
          </Link>
          <h1 className="text-2xl font-bold">Add New Product</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Organic Honey" required />
              </div>
              <div>
                <Label htmlFor="shortDesc">Short Description</Label>
                <Input id="shortDesc" value={form.shortDesc} onChange={(e) => setForm({ ...form, shortDesc: e.target.value })} placeholder="Brief one-liner" />
              </div>
              <div>
                <Label htmlFor="desc">Description *</Label>
                <Textarea id="desc" rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Detailed product description..." required />
              </div>
              <div>
                <Label htmlFor="category">Category *</Label>
                <select id="category" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} required>
                  <option value="">Select category</option>
                  {categories.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="organic" checked={form.isOrganic} onChange={(e) => setForm({ ...form, isOrganic: e.target.checked })} className="rounded" />
                <Label htmlFor="organic">This is an organic product</Label>
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Stock */}
          <Card>
            <CardHeader><CardTitle>Pricing & Inventory</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Selling Price (₹) *</Label>
                  <Input id="price" type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="comparePrice">Compare Price (₹)</Label>
                  <Input id="comparePrice" type="number" step="0.01" min="0" value={form.comparePrice} onChange={(e) => setForm({ ...form, comparePrice: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="stock">Stock Quantity *</Label>
                  <Input id="stock" type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="minOrder">Min Order</Label>
                  <Input id="minOrder" type="number" min="1" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="maxOrder">Max Order</Label>
                  <Input id="maxOrder" type="number" min="1" value={form.maxOrder} onChange={(e) => setForm({ ...form, maxOrder: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="weight">Weight</Label>
                  <Input id="weight" type="number" step="0.01" min="0" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="unit">Unit</Label>
                  <select id="unit" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                    <option value="piece">Piece</option>
                    <option value="kg">Kg</option>
                    <option value="g">Gram</option>
                    <option value="liter">Liter</option>
                    <option value="ml">mL</option>
                    <option value="pack">Pack</option>
                    <option value="box">Box</option>
                    <option value="set">Set</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader><CardTitle>Images</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-500">Add image URLs (up to 8 images)</p>
              <div className="flex gap-2">
                <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://example.com/image.jpg" />
                <Button type="button" variant="outline" onClick={addImage} disabled={!imageUrl.trim()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {form.images.length > 0 && (
                <div className="grid grid-cols-4 gap-3">
                  {form.images.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img src={img} alt={`Product ${idx + 1}`} className="w-full h-24 object-cover rounded-lg border" onError={(e) => (e.currentTarget.src = "/placeholder.png")} />
                      <button type="button" onClick={() => removeImage(idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader><CardTitle>Tags</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="e.g. organic, honey" onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())} />
                <Button type="button" variant="outline" onClick={addTag} disabled={!tagInput.trim()}>Add</Button>
              </div>
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)}><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardHeader><CardTitle>SEO (Optional)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input id="metaTitle" value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="metaDesc">Meta Description</Label>
                <Textarea id="metaDesc" rows={2} value={form.metaDesc} onChange={(e) => setForm({ ...form, metaDesc: e.target.value })} />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Link href="/vendor/dashboard"><Button variant="outline" type="button">Cancel</Button></Link>
            <Button type="submit" disabled={loading}>
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : "Create Product"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
