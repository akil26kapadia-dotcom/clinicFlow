import { useState } from "react";
import { useListPatients, useCreatePatient, useUpdatePatient, useDeletePatient } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Plus, Edit2, Trash2 } from "lucide-react";

export default function Patients() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const { data: patients, isLoading } = useListPatients({ search: search || undefined });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    name: "", phone: "", email: "", address: "", age: 0, gender: "Male", medicalHistory: ""
  });

  const createMut = useCreatePatient({ onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/patients"] }); setIsModalOpen(false); } });
  const updateMut = useUpdatePatient({ onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/patients"] }); setIsModalOpen(false); } });
  const deleteMut = useDeletePatient({ onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/patients"] }) });

  const openNew = () => {
    setEditingId(null);
    setFormData({ name: "", phone: "", email: "", address: "", age: 0, gender: "Male", medicalHistory: "" });
    setIsModalOpen(true);
  };

  const openEdit = (p: any) => {
    setEditingId(p.id);
    setFormData({ name: p.name, phone: p.phone, email: p.email || "", address: p.address || "", age: p.age || 0, gender: p.gender || "Male", medicalHistory: p.medicalHistory || "" });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) updateMut.mutate({ id: editingId, data: formData });
    else createMut.mutate({ data: formData });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Patients</h1>
          <p className="text-muted-foreground mt-1">Manage your clinic's patient records.</p>
        </div>
        <div className="flex w-full sm:w-auto items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="Search patients..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-xl bg-card border-border/50 shadow-sm"
            />
          </div>
          <Button onClick={openNew} className="rounded-xl gap-2 shadow-md">
            <Plus size={18} /> Add Patient
          </Button>
        </div>
      </div>

      <Card className="rounded-2xl border-border/50 shadow-md shadow-black/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-semibold">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Age/Gender</th>
                <th className="px-6 py-4">Last Visit</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : patients?.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No patients found.</td></tr>
              ) : patients?.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">{p.name}</td>
                  <td className="px-6 py-4">{p.phone}</td>
                  <td className="px-6 py-4">{p.age ? `${p.age}, ` : ''}{p.gender}</td>
                  <td className="px-6 py-4">{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'New'}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(p)} className="rounded-lg h-8 w-8 p-0">
                      <Edit2 size={14} className="text-primary" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => deleteMut.mutate({ id: p.id })} className="rounded-lg h-8 w-8 p-0 border-destructive/30 hover:bg-destructive/10">
                      <Trash2 size={14} className="text-destructive" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-display">{editingId ? "Edit Patient" : "New Patient"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold">Name</label>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="rounded-xl" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold">Phone</label>
                <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required className="rounded-xl" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold">Age</label>
                <Input type="number" value={formData.age} onChange={e => setFormData({...formData, age: Number(e.target.value)})} className="rounded-xl" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold">Gender</label>
                <select 
                  className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}
                >
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Email</label>
              <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="rounded-xl" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Medical History / Notes</label>
              <textarea 
                className="flex min-h-[80px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={formData.medicalHistory} onChange={e => setFormData({...formData, medicalHistory: e.target.value})}
              />
            </div>
            <Button type="submit" disabled={createMut.isPending || updateMut.isPending} className="w-full rounded-xl h-11 text-base shadow-md">
              {editingId ? "Save Changes" : "Create Patient"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
