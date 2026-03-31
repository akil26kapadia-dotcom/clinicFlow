import { useState } from "react";
import { useListTreatments, useCreateTreatment, useUpdateTreatment, useDeleteTreatment } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function Treatments() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: treatments, isLoading } = useListTreatments();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    name: "", cost: 0, duration: 30, description: ""
  });

  const createMut = useCreateTreatment({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/treatments"] });
      setIsModalOpen(false);
      toast({ title: "Service added", description: `"${formData.name}" has been added to the catalog.` });
    },
    onError: () => toast({ title: "Failed to add service", description: "Please check the details and try again.", variant: "destructive" }),
  });
  const updateMut = useUpdateTreatment({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/treatments"] });
      setIsModalOpen(false);
      toast({ title: "Service updated", description: "Treatment details have been saved." });
    },
    onError: () => toast({ title: "Update failed", description: "Could not save changes.", variant: "destructive" }),
  });
  const deleteMut = useDeleteTreatment({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/treatments"] });
      toast({ title: "Service removed", description: "Treatment has been deleted from the catalog.", variant: "destructive" });
    },
    onError: () => toast({ title: "Delete failed", description: "Could not remove treatment.", variant: "destructive" }),
  });

  const openNew = () => {
    setEditingId(null);
    setFormData({ name: "", cost: 0, duration: 30, description: "" });
    setIsModalOpen(true);
  };

  const openEdit = (t: any) => {
    setEditingId(t.id);
    setFormData({ name: t.name, cost: t.cost, duration: t.duration || 30, description: t.description || "" });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) updateMut.mutate({ id: editingId, data: formData });
    else createMut.mutate({ data: formData });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Treatments Catalog</h1>
          <p className="text-muted-foreground mt-1">Manage clinic services and standard pricing.</p>
        </div>
        <Button onClick={openNew} className="rounded-xl gap-2 shadow-md">
          <Plus size={18} /> Add Service
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <p className="text-muted-foreground p-4">Loading catalog...</p>
        ) : treatments?.map((t) => (
          <Card key={t.id} className="p-6 rounded-2xl border-border/50 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-foreground leading-tight">{t.name}</h3>
                <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-lg text-sm font-bold whitespace-nowrap ml-2">
                  {formatCurrency(t.cost)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{t.description || "No description provided."}</p>
            </div>
            <div className="flex items-center justify-between border-t border-border/50 pt-4 mt-auto">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                ⏱ {t.duration} mins
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => openEdit(t)} className="h-8 rounded-lg px-3">Edit</Button>
                <Button variant="outline" size="sm" onClick={() => deleteMut.mutate({ id: t.id })} className="h-8 rounded-lg px-3 text-destructive border-destructive/30 hover:bg-destructive/10">Delete</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-display">{editingId ? "Edit Treatment" : "New Treatment"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Service Name</label>
              <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold">Cost (₹)</label>
                <Input type="number" value={formData.cost} onChange={e => setFormData({...formData, cost: Number(e.target.value)})} required className="rounded-xl" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold">Duration (mins)</label>
                <Input type="number" value={formData.duration} onChange={e => setFormData({...formData, duration: Number(e.target.value)})} className="rounded-xl" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Description</label>
              <textarea 
                className="flex min-h-[80px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <Button type="submit" disabled={createMut.isPending || updateMut.isPending} className="w-full rounded-xl h-11 text-base shadow-md">
              {editingId ? "Save Changes" : "Create Service"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
