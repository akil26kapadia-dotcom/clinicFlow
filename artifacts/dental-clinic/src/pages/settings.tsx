import { useState, useEffect, useRef } from "react";
import { useGetSettings, useUpdateSettings } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Save, Upload, Building2, Palette, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const colorPresets = [
  { label: "Ocean Blue", primary: "#2F80ED", accent: "#27AE60" },
  { label: "Teal", primary: "#0D9488", accent: "#7C3AED" },
  { label: "Royal Purple", primary: "#7C3AED", accent: "#D97706" },
  { label: "Crimson Red", primary: "#DC2626", accent: "#059669" },
  { label: "Slate", primary: "#475569", accent: "#2563EB" },
  { label: "Emerald", primary: "#059669", accent: "#7C3AED" },
  { label: "Amber", primary: "#D97706", accent: "#0D9488" },
  { label: "Indigo", primary: "#4F46E5", accent: "#EC4899" },
];

export default function Settings() {
  const { data: settings, isLoading } = useGetSettings();
  const updateMut = useUpdateSettings();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "", phone: "", clinicName: "", gstNumber: "", clinicAddress: "",
    logoUrl: "", primaryColor: "#2F80ED", accentColor: "#27AE60"
  });
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        name: settings.name || "",
        phone: settings.phone || "",
        clinicName: settings.clinicName || "",
        gstNumber: settings.gstNumber || "",
        clinicAddress: settings.clinicAddress || "",
        logoUrl: settings.logoUrl || "",
        primaryColor: settings.primaryColor || "#2F80ED",
        accentColor: settings.accentColor || "#27AE60",
      });
      if (settings.logoUrl) setLogoPreview(settings.logoUrl);
    }
  }, [settings]);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "File too large", description: "Please upload an image under 2MB.", variant: "destructive" });
      return;
    }
    setUploadingLogo(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      setLogoPreview(base64);
      setFormData(prev => ({ ...prev, logoUrl: base64 }));
      setUploadingLogo(false);
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoPreview("");
    setFormData(prev => ({ ...prev, logoUrl: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const applyColorPreset = (preset: typeof colorPresets[0]) => {
    setFormData(prev => ({ ...prev, primaryColor: preset.primary, accentColor: preset.accent }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMut.mutate({ data: formData }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
        queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
        toast({ title: "Settings Saved", description: "Clinic profile updated successfully." });
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to update settings.", variant: "destructive" });
      }
    });
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-64 text-muted-foreground">Loading settings...</div>
  );

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">Clinic Profile</h1>
        <p className="text-muted-foreground mt-1 text-sm">Manage your practice details, branding, and billing information.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Logo Upload */}
        <Card className="p-5 md:p-6 rounded-2xl border-border/50 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Upload size={18} className="text-primary" />
            <h3 className="font-bold text-base">Clinic Logo</h3>
          </div>
          <div className="flex items-center gap-5">
            <div className="relative w-24 h-24 rounded-2xl border-2 border-dashed border-border bg-muted/30 flex items-center justify-center overflow-hidden flex-shrink-0">
              {logoPreview ? (
                <>
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="absolute top-1 right-1 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center shadow"
                  >
                    <X size={10} />
                  </button>
                </>
              ) : (
                <Building2 size={28} className="text-muted-foreground" />
              )}
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Upload Clinic Logo</p>
              <p className="text-xs text-muted-foreground">PNG, JPG up to 2MB. Displays in sidebar and invoices.</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
                id="logo-upload"
              />
              <label htmlFor="logo-upload">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-lg cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingLogo}
                >
                  <Upload size={14} className="mr-1.5" />
                  {uploadingLogo ? "Processing..." : "Choose Image"}
                </Button>
              </label>
            </div>
          </div>
        </Card>

        {/* Color Customization */}
        <Card className="p-5 md:p-6 rounded-2xl border-border/50 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Palette size={18} className="text-primary" />
            <h3 className="font-bold text-base">Brand Colors</h3>
          </div>

          <div className="space-y-5">
            <div>
              <p className="text-sm font-semibold mb-3">Quick Presets</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {colorPresets.map((preset) => {
                  const isSelected = formData.primaryColor === preset.primary;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => applyColorPreset(preset)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                        isSelected
                          ? "border-foreground bg-foreground/5 shadow-sm"
                          : "border-border hover:border-foreground/40 hover:bg-muted"
                      }`}
                    >
                      <div className="flex gap-1 flex-shrink-0">
                        <div className="w-3.5 h-3.5 rounded-full" style={{ background: preset.primary }} />
                        <div className="w-3.5 h-3.5 rounded-full" style={{ background: preset.accent }} />
                      </div>
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/50">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Primary Color</label>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl border border-border shadow-sm flex-shrink-0 cursor-pointer relative overflow-hidden"
                    style={{ background: formData.primaryColor }}
                  >
                    <input
                      type="color"
                      value={formData.primaryColor}
                      onChange={e => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    />
                  </div>
                  <Input
                    value={formData.primaryColor}
                    onChange={e => setFormData({ ...formData, primaryColor: e.target.value })}
                    className="rounded-xl font-mono uppercase h-10 text-sm"
                    maxLength={7}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Accent Color</label>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl border border-border shadow-sm flex-shrink-0 cursor-pointer relative overflow-hidden"
                    style={{ background: formData.accentColor }}
                  >
                    <input
                      type="color"
                      value={formData.accentColor}
                      onChange={e => setFormData({ ...formData, accentColor: e.target.value })}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    />
                  </div>
                  <Input
                    value={formData.accentColor}
                    onChange={e => setFormData({ ...formData, accentColor: e.target.value })}
                    className="rounded-xl font-mono uppercase h-10 text-sm"
                    maxLength={7}
                  />
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground mb-2">Preview</p>
              <div className="flex gap-2 flex-wrap">
                <div
                  className="px-4 py-2 rounded-xl text-white text-sm font-medium shadow-sm"
                  style={{ background: formData.primaryColor }}
                >
                  Primary Button
                </div>
                <div
                  className="px-4 py-2 rounded-xl text-white text-sm font-medium shadow-sm"
                  style={{ background: formData.accentColor }}
                >
                  Accent Button
                </div>
                <div
                  className="px-3 py-2 rounded-xl text-sm font-medium border-2"
                  style={{ borderColor: formData.primaryColor, color: formData.primaryColor }}
                >
                  Outline
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Clinic Profile */}
        <Card className="p-5 md:p-6 rounded-2xl border-border/50 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Building2 size={18} className="text-primary" />
            <h3 className="font-bold text-base">Clinic Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">Admin Name</label>
              <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">Contact Phone</label>
              <Input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="rounded-xl" placeholder="+91 98765 43210" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">Clinic Name</label>
              <Input value={formData.clinicName} onChange={e => setFormData({ ...formData, clinicName: e.target.value })} required className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">GSTIN / Registration No.</label>
              <Input
                value={formData.gstNumber}
                onChange={e => setFormData({ ...formData, gstNumber: e.target.value })}
                className="rounded-xl font-mono uppercase"
                placeholder="22AAAAA0000A1Z5"
              />
              <p className="text-xs text-muted-foreground">Appears on invoices</p>
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-semibold">Full Clinic Address</label>
              <textarea
                className="flex min-h-[90px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                value={formData.clinicAddress}
                onChange={e => setFormData({ ...formData, clinicAddress: e.target.value })}
                placeholder="123, MG Road, Bengaluru, Karnataka - 560001"
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end pb-2">
          <Button type="submit" disabled={updateMut.isPending} className="rounded-xl h-11 px-8 shadow-md text-sm font-semibold">
            <Save size={16} className="mr-2" />
            {updateMut.isPending ? "Saving..." : "Save All Settings"}
          </Button>
        </div>
      </form>
    </div>
  );
}
