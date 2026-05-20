"use client";

import { useState } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Save, Globe, CreditCard, Truck, Mail, ShieldCheck, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminSettingsPage() {
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    siteName: "Homemade Everything",
    siteDescription: "India's premier marketplace for authentic homemade products",
    supportEmail: "support@homemadeeverything.com",
    defaultCommission: "10",
    minOrderForFreeDelivery: "500",
    deliveryCharge: "50",
    gstRate: "5",
    maxProductImages: "5",
    maxFileSize: "4",
    maintenanceMode: false,
  });

  const handleSave = async () => {
    setSaving(true);
    // In production, save to database or config
    setTimeout(() => {
      setSaving(false);
      toast.success("Settings saved successfully");
    }, 1000);
  };

  const updateSetting = (key: string, value: string | boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="lg:ml-64 p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Settings</h1>
          <Button onClick={handleSave} className="bg-orange-600 hover:bg-orange-700" disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Save className="h-4 w-4 mr-2" /> Save Settings
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Globe className="h-5 w-5" /> General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Site Name</Label>
                <Input value={settings.siteName} onChange={(e) => updateSetting("siteName", e.target.value)} />
              </div>
              <div>
                <Label>Site Description</Label>
                <Input value={settings.siteDescription} onChange={(e) => updateSetting("siteDescription", e.target.value)} />
              </div>
              <div>
                <Label>Support Email</Label>
                <Input type="email" value={settings.supportEmail} onChange={(e) => updateSetting("supportEmail", e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="h-5 w-5" /> Payments & Commission
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Default Commission (%)</Label>
                <Input type="number" value={settings.defaultCommission} onChange={(e) => updateSetting("defaultCommission", e.target.value)} />
              </div>
              <div>
                <Label>GST Rate (%)</Label>
                <Input type="number" value={settings.gstRate} onChange={(e) => updateSetting("gstRate", e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Truck className="h-5 w-5" /> Delivery
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Free Delivery Above (₹)</Label>
                <Input type="number" value={settings.minOrderForFreeDelivery} onChange={(e) => updateSetting("minOrderForFreeDelivery", e.target.value)} />
              </div>
              <div>
                <Label>Delivery Charge (₹)</Label>
                <Input type="number" value={settings.deliveryCharge} onChange={(e) => updateSetting("deliveryCharge", e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShieldCheck className="h-5 w-5" /> Security & Limits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Max Product Images</Label>
                <Input type="number" value={settings.maxProductImages} onChange={(e) => updateSetting("maxProductImages", e.target.value)} />
              </div>
              <div>
                <Label>Max File Size (MB)</Label>
                <Input type="number" value={settings.maxFileSize} onChange={(e) => updateSetting("maxFileSize", e.target.value)} />
              </div>
              <div className="flex items-center justify-between pt-2">
                <div>
                  <Label>Maintenance Mode</Label>
                  <p className="text-xs text-gray-500">Disable public access to the site</p>
                </div>
                <button
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.maintenanceMode ? "bg-red-500" : "bg-gray-300"
                  }`}
                  onClick={() => updateSetting("maintenanceMode", !settings.maintenanceMode)}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.maintenanceMode ? "translate-x-6" : "translate-x-1"
                  }`} />
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
