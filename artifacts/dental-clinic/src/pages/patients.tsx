import { useState } from "react";
import { useListPatients, useCreatePatient, useUpdatePatient, useDeletePatient } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Plus, Edit2, Trash2, Users, Phone, User } from "lucide-react";

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

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Delete patient "${name}"? This cannot be undone.`)) {
      deleteMut.mutate({ id });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) updateMut.mutate({ id: editingId, data: formData });
    else createMut.mutate({ data: formData });
  };

  const avatarColor = (name: string) => {
    const colors = ["bg-blue-100 text-blue-700", "bg-purple-100 text-purple-700", "bg-green-100 text-green-700", "bg-rose-100 text-rose-700", "bg-amber-100 text-amber-700", "bg-teal-100 text-teal-700"];
    return colors[name.charCodeAt(0) % colors.length];
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">Patients</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">Manage your clinic's patient records.</p>
        </div>
        <Button onClick={openNew} className="rounded-xl gap-2 shadow-md w-full sm:w-auto">
          <Plus size={16} /> Add Patient
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 rounded-xl bg-card border-border/50 shadow-sm h-11"
        />
      </div>

      {/* Desktop Table */}
      <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden hidden sm:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-semibold">
              <tr>
                <th className="px-5 py-4">Patient</th>
                <th className="px-5 py-4">Phone</th>
                <th className="px-5 py-4">Age / Gender</th>
                <th className="px-5 py-4">Registered</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : patients?.length === 0 ? (
                <tr><td colSpan={5} className="p-10 text-center text-muted-foreground">
                  {search ? `No patients matching "${search}"` : "No patients yet. Add your first patient."}
                </td></tr>
              ) : patients?.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30 transition-colors group">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${avatarColor(p.name)}`}>
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{p.name}</p>
                        {p.email && <p className="text-xs text-muted-foreground">{p.email}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{p.phone}</td>
                  <td className="px-5 py-4 text-muted-foreground">{p.age ? `${p.age} yrs` : "—"} · {p.gender || "—"}</td>
                  <td className="px-5 py-4 text-muted-foreground">{p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-IN") : "New"}</td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="outline" size="sm" onClick={() => openEdit(p)} className="rounded-lg h-8 w-8 p-0">
                        <Edit2 size={13} className="text-primary" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(p.id, p.name)} className="rounded-lg h-8 w-8 p-0 border-destructive/30 hover:bg-destructive/10">
                        <Trash2 size={13} className="text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {patients && patients.length > 0 && (
          <div className="px-5 py-3 border-t border-border/50 bg-muted/20 text-xs text-muted-foreground">
            {patients.length} patient{patients.length !== 1 ? "s" : ""} {search ? "found" : "total"}
          </div>
        )}
      </Card>

      {/* Mobile Cards */}
      <div className="sm:hidden space-y-3">
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : patients?.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Users size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">{search ? `No results for "${search}"` : "No patients yet"}</p>
            {!search && <p className="text-sm mt-1">Tap the button above to add your first patient</p>}
          </div>
        ) : patients?.map((p) => (
          <Card key={p.id} className="rounded-2xl border-border/50 shadow-sm p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center text-base font-bold flex-shrink-0 ${avatarColor(p.name)}`}>
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-foreground text-base">{p.name}</p>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                    <Phone size={11} />
                    {p.phone}
                  </div>
                  {p.email && <p className="text-xs text-muted-foreground mt-0.5">{p.email}</p>}
                </div>
              </div>
              <div className="flex gap-1.5">
                <Button variant="outline" size="sm" onClick={() => openEdit(p)} className="rounded-lg h-8 w-8 p-0">
                  <Edit2 size={13} className="text-primary" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(p.id, p.name)} className="rounded-lg h-8 w-8 p-0 border-destructive/30 hover:bg-destructive/10">
                  <Trash2 size={13} className="text-destructive" />
                </Button>
              </div>
            </div>
            {(p.age || p.gender) && (
              <div className="flex gap-2 mt-3 pt-3 border-t border-border/40">
                {p.age && (
                  <span className="text-xs bg-muted px-2.5 py-1 rounded-lg text-muted-foreground font-medium">{p.age} yrs</span>
                )}
                {p.gender && (
                  <span className="text-xs bg-muted px-2.5 py-1 rounded-lg text-muted-foreground font-medium">{p.gender}</span>
                )}
                <span className="text-xs bg-muted px-2.5 py-1 rounded-lg text-muted-foreground font-medium ml-auto">
                  {p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-IN") : "New"}
                </span>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-display">{editingId ? "Edit Patient" : "New Patient"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Full Name *</label>
                <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required className="rounded-xl" placeholder="Patient's full name" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Phone *</label>
                <Input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} required className="rounded-xl" placeholder="9876543210" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Email</label>
                <Input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="rounded-xl" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Age</label>
                <Input type="number" value={formData.age || ""} onChange={e => setFormData({ ...formData, age: Number(e.target.value) })} className="rounded-xl" min="0" max="150" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Gender</label>
                <select
                  className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.gender}
                  onChange={e => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Address</label>
                <Input value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="rounded-xl" placeholder="Optional" />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Medical History / Notes</label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                  value={formData.medicalHistory}
                  onChange={e => setFormData({ ...formData, medicalHistory: e.target.value })}
                  placeholder="Allergies, conditions, notes..."
                />
              </div>
            </div>
            <Button type="submit" disabled={createMut.isPending || updateMut.isPending} className="w-full rounded-xl h-11 text-sm font-semibold shadow-md">
              {createMut.isPending || updateMut.isPending ? "Saving..." : editingId ? "Save Changes" : "Create Patient"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
