import { useState } from "react";
import { useListAppointments, useCreateAppointment, useUpdateAppointment, useDeleteAppointment, useListPatients } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, Calendar as CalIcon, Clock } from "lucide-react";

export default function Appointments() {
  const queryClient = useQueryClient();
  const { data: appointments, isLoading } = useListAppointments({});
  const { data: patients } = useListPatients({});
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    patientId: 0, doctor: "", date: "", time: "", treatment: "", notes: "", status: "Scheduled"
  });

  const createMut = useCreateAppointment({ onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/appointments"] }); setIsModalOpen(false); } });
  const updateMut = useUpdateAppointment({ onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/appointments"] }); setIsModalOpen(false); } });
  const deleteMut = useDeleteAppointment({ onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/appointments"] }) });

  const openNew = () => {
    setEditingId(null);
    setFormData({ patientId: patients?.[0]?.id || 0, doctor: "Dr. Admin", date: new Date().toISOString().split('T')[0], time: "10:00", treatment: "", notes: "", status: "Scheduled" });
    setIsModalOpen(true);
  };

  const openEdit = (a: any) => {
    setEditingId(a.id);
    setFormData({ patientId: a.patientId, doctor: a.doctor, date: a.date, time: a.time, treatment: a.treatment || "", notes: a.notes || "", status: a.status });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) updateMut.mutate({ id: editingId, data: formData });
    else createMut.mutate({ data: formData });
  };

  const statusColors: Record<string, string> = {
    "Scheduled": "bg-blue-100 text-blue-700 border-blue-200",
    "Completed": "bg-emerald-100 text-emerald-700 border-emerald-200",
    "Cancelled": "bg-rose-100 text-rose-700 border-rose-200",
    "No Show": "bg-gray-100 text-gray-700 border-gray-200",
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Appointments</h1>
          <p className="text-muted-foreground mt-1">Schedule and manage visits.</p>
        </div>
        <Button onClick={openNew} className="rounded-xl gap-2 shadow-md">
          <Plus size={18} /> New Appointment
        </Button>
      </div>

      <Card className="rounded-2xl border-border/50 shadow-md shadow-black/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-semibold">
              <tr>
                <th className="px-6 py-4">Patient</th>
                <th className="px-6 py-4">Doctor</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Treatment</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : appointments?.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No appointments.</td></tr>
              ) : appointments?.map((a) => (
                <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">{a.patientName}</td>
                  <td className="px-6 py-4">{a.doctor}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-foreground">
                      <CalIcon size={14} className="text-primary"/> {new Date(a.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground mt-1 text-xs">
                      <Clock size={12} /> {a.time}
                    </div>
                  </td>
                  <td className="px-6 py-4">{a.treatment || "-"}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusColors[a.status] || "bg-secondary text-secondary-foreground"}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(a)} className="rounded-lg h-8 w-8 p-0">
                      <Edit2 size={14} className="text-primary" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => deleteMut.mutate({ id: a.id })} className="rounded-lg h-8 w-8 p-0 border-destructive/30 hover:bg-destructive/10">
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
            <DialogTitle className="text-xl font-display">{editingId ? "Edit Appointment" : "New Appointment"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Patient</label>
              <select 
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={formData.patientId} onChange={e => setFormData({...formData, patientId: Number(e.target.value)})}
                required
              >
                <option value={0} disabled>Select a patient</option>
                {patients?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold">Date</label>
                <Input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required className="rounded-xl" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold">Time</label>
                <Input type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} required className="rounded-xl" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold">Doctor</label>
                <Input value={formData.doctor} onChange={e => setFormData({...formData, doctor: e.target.value})} required className="rounded-xl" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold">Status</label>
                <select 
                  className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
                >
                  <option>Scheduled</option><option>Completed</option><option>Cancelled</option><option>No Show</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Treatment (Optional)</label>
              <Input value={formData.treatment} onChange={e => setFormData({...formData, treatment: e.target.value})} className="rounded-xl" />
            </div>
            <Button type="submit" disabled={createMut.isPending || updateMut.isPending} className="w-full rounded-xl h-11 text-base shadow-md">
              {editingId ? "Save Changes" : "Book Appointment"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
