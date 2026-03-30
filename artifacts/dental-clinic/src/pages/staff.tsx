import { useState } from "react";
import { useListStaff, useCreateStaff, useUpdateStaff, useDeleteStaff } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, Mail, Phone } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function Staff() {
  const queryClient = useQueryClient();
  const { data: staffList, isLoading } = useListStaff();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    name: "", role: "Dentist", phone: "", email: "", specialization: "", salary: 0, status: "Active", joiningDate: new Date().toISOString().split('T')[0]
  });

  const createMut = useCreateStaff({ onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/staff"] }); setIsModalOpen(false); } });
  const updateMut = useUpdateStaff({ onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/staff"] }); setIsModalOpen(false); } });
  const deleteMut = useDeleteStaff({ onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/staff"] }) });

  const openNew = () => {
    setEditingId(null);
    setFormData({ name: "", role: "Dentist", phone: "", email: "", specialization: "", salary: 0, status: "Active", joiningDate: new Date().toISOString().split('T')[0] });
    setIsModalOpen(true);
  };

  const openEdit = (s: any) => {
    setEditingId(s.id);
    setFormData({ name: s.name, role: s.role, phone: s.phone || "", email: s.email || "", specialization: s.specialization || "", salary: s.salary || 0, status: s.status || "Active", joiningDate: s.joiningDate || "" });
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
          <h1 className="text-3xl font-display font-bold text-foreground">Clinic Staff</h1>
          <p className="text-muted-foreground mt-1">Manage doctors, assistants, and receptionists.</p>
        </div>
        <Button onClick={openNew} className="rounded-xl gap-2 shadow-md">
          <Plus size={18} /> Add Member
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          <p className="text-muted-foreground p-4">Loading staff...</p>
        ) : staffList?.map((s) => (
          <Card key={s.id} className="p-6 rounded-2xl border-border/50 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl">
                  {s.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground">{s.name}</h3>
                  <p className="text-sm font-medium text-primary">{s.role}</p>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${s.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                {s.status}
              </span>
            </div>
            
            <div className="mt-5 space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone size={14} /> {s.phone || "-"}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail size={14} /> {s.email || "-"}
              </div>
              {s.specialization && (
                <div className="inline-block mt-2 px-2 py-1 bg-secondary rounded text-xs font-medium">
                  Spec: {s.specialization}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-border/50 pt-4 mt-5">
              <div className="text-xs text-muted-foreground">
                Salary: <strong className="text-foreground">{formatCurrency(s.salary)}</strong>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => openEdit(s)} className="h-8 rounded-lg px-3">Edit</Button>
                <Button variant="outline" size="sm" onClick={() => deleteMut.mutate({ id: s.id })} className="h-8 rounded-lg px-3 text-destructive border-destructive/30 hover:bg-destructive/10">Delete</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-display">{editingId ? "Edit Staff Member" : "Add Staff Member"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Full Name</label>
              <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold">Role</label>
                <select 
                  className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
                >
                  <option>Dentist</option><option>Assistant</option><option>Receptionist</option><option>Manager</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold">Status</label>
                <select 
                  className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
                >
                  <option>Active</option><option>Inactive</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold">Phone</label>
                <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="rounded-xl" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold">Email</label>
                <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="rounded-xl" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold">Specialization</label>
                <Input value={formData.specialization} onChange={e => setFormData({...formData, specialization: e.target.value})} className="rounded-xl" placeholder="e.g. Orthodontist" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold">Salary / Month (₹)</label>
                <Input type="number" value={formData.salary} onChange={e => setFormData({...formData, salary: Number(e.target.value)})} className="rounded-xl" />
              </div>
            </div>
            <Button type="submit" disabled={createMut.isPending || updateMut.isPending} className="w-full rounded-xl h-11 text-base shadow-md">
              {editingId ? "Save Changes" : "Add Staff"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
