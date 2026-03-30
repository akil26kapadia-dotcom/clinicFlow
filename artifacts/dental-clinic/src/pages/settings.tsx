import { useState, useEffect } from "react";
import { useGetSettings, useUpdateSettings } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { data: settings, isLoading } = useGetSettings();
  const updateMut = useUpdateSettings();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "", phone: "", clinicName: "", gstNumber: "", clinicAddress: ""
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        name: settings.name || "",
        phone: settings.phone || "",
        clinicName: settings.clinicName || "",
        gstNumber: settings.gstNumber || "",
        clinicAddress: settings.clinicAddress || ""
      });
    }
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMut.mutate({ data: formData }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
        queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] }); // Update sidebar name
        toast({ title: "Settings Saved", description: "Clinic profile updated successfully." });
      },
      onError: (err) => {
        toast({ title: "Error", description: "Failed to update settings.", variant: "destructive" });
      }
    });
  };

  if (isLoading) return <div className="p-8 text-center">Loading settings...</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Clinic Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your practice details and billing information.</p>
      </div>

      <Card className="p-6 rounded-2xl border-border/50 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Admin Name</label>
              <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Contact Phone</label>
              <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="rounded-xl" />
            </div>
            <div className="space-y-2 md:col-span-2 border-t pt-6 mt-2">
              <h4 className="font-bold mb-4">Clinic Information</h4>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Clinic Name</label>
              <Input value={formData.clinicName} onChange={e => setFormData({...formData, clinicName: e.target.value})} required className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">GSTIN / Registration Number</label>
              <Input value={formData.gstNumber} onChange={e => setFormData({...formData, gstNumber: e.target.value})} className="rounded-xl font-mono uppercase" />
              <p className="text-xs text-muted-foreground">Will appear on invoices</p>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold">Full Address</label>
              <textarea 
                className="flex min-h-[100px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={formData.clinicAddress} onChange={e => setFormData({...formData, clinicAddress: e.target.value})}
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border/50">
            <Button type="submit" disabled={updateMut.isPending} className="rounded-xl h-11 px-8 shadow-md">
              <Save size={18} className="mr-2" />
              {updateMut.isPending ? "Saving..." : "Save Configuration"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
