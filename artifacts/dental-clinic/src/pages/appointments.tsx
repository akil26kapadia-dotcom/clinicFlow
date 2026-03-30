import { useState } from "react";
import { useListAppointments, useCreateAppointment, useUpdateAppointment, useDeleteAppointment, useListPatients } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, Calendar as CalIcon, Clock, User } from "lucide-react";

const statusColors: Record<string, string> = {
  "Scheduled": "bg-blue-100 text-blue-700 border-blue-200",
  "Completed": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Cancelled": "bg-rose-100 text-rose-700 border-rose-200",
  "No Show": "bg-gray-100 text-gray-600 border-gray-200",
};

const statusDots: Record<string, string> = {
  "Scheduled": "bg-blue-500",
  "Completed": "bg-emerald-500",
  "Cancelled": "bg-rose-500",
  "No Show": "bg-gray-400",
};

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
    setFormData({
      patientId: patients?.[0]?.id || 0,
      doctor: "",
      date: new Date().toISOString().split("T")[0],
      time: "10:00",
      treatment: "",
      notes: "",
      status: "Scheduled"
    });
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

  const handleDelete = (id: number) => {
    if (confirm("Delete this appointment?")) deleteMut.mutate({ id });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">Appointments</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">Schedule and manage patient visits.</p>
        </div>
        <Button onClick={openNew} className="rounded-xl gap-2 shadow-md w-full sm:w-auto">
          <Plus size={16} /> New Appointment
        </Button>
      </div>

      {/* Desktop Table */}
      <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden hidden sm:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-semibold">
              <tr>
                <th className="px-5 py-4">Patient</th>
                <th className="px-5 py-4">Doctor</th>
                <th className="px-5 py-4">Date & Time</th>
                <th className="px-5 py-4">Treatment</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : appointments?.length === 0 ? (
                <tr><td colSpan={6} className="p-10 text-center text-muted-foreground">No appointments scheduled.</td></tr>
              ) : appointments?.map((a) => (
                <tr key={a.id} className="hover:bg-muted/30 transition-colors group">
                  <td className="px-5 py-4 font-semibold text-foreground">{a.patientName}</td>
                  <td className="px-5 py-4 text-muted-foreground">{a.doctor}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-foreground text-sm">
                      <CalIcon size={13} className="text-primary flex-shrink-0" />
                      {new Date(a.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs mt-1">
                      <Clock size={11} className="flex-shrink-0" /> {a.time}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{a.treatment || "—"}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusColors[a.status] || ""}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusDots[a.status] || "bg-gray-400"}`} />
                      {a.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="outline" size="sm" onClick={() => openEdit(a)} className="rounded-lg h-8 w-8 p-0">
                        <Edit2 size={13} className="text-primary" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(a.id)} className="rounded-lg h-8 w-8 p-0 border-destructive/30 hover:bg-destructive/10">
                        <Trash2 size={13} className="text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {appointments && appointments.length > 0 && (
          <div className="px-5 py-3 border-t border-border/50 bg-muted/20 text-xs text-muted-foreground">
            {appointments.length} appointment{appointments.length !== 1 ? "s" : ""} total
          </div>
        )}
      </Card>

      {/* Mobile Cards */}
      <div className="sm:hidden space-y-3">
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : appointments?.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <CalIcon size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No appointments yet</p>
            <p className="text-sm mt-1">Tap the button above to schedule one</p>
          </div>
        ) : appointments?.map((a) => (
          <Card key={a.id} className="rounded-2xl border-border/50 shadow-sm p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${statusColors[a.status] || ""}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusDots[a.status] || "bg-gray-400"}`} />
                    {a.status}
                  </span>
                </div>
                <p className="font-bold text-foreground text-base truncate">{a.patientName}</p>
                <div className="flex items-center gap-3 mt-1.5 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <CalIcon size={12} className="text-primary" />
                    {new Date(a.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    {a.time}
                  </div>
                </div>
                {a.doctor && (
                  <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
                    <User size={11} />
                    {a.doctor}
                  </div>
                )}
                {a.treatment && (
                  <p className="text-xs text-muted-foreground mt-1 truncate">💉 {a.treatment}</p>
                )}
              </div>
              <div className="flex flex-col gap-1.5 flex-shrink-0">
                <Button variant="outline" size="sm" onClick={() => openEdit(a)} className="rounded-lg h-8 w-8 p-0">
                  <Edit2 size={13} className="text-primary" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(a.id)} className="rounded-lg h-8 w-8 p-0 border-destructive/30 hover:bg-destructive/10">
                  <Trash2 size={13} className="text-destructive" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Form Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-display">{editingId ? "Edit Appointment" : "New Appointment"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Patient *</label>
              <select
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={formData.patientId}
                onChange={e => setFormData({ ...formData, patientId: Number(e.target.value) })}
                required
              >
                <option value={0} disabled>Select a patient</option>
                {patients?.map(p => <option key={p.id} value={p.id}>{p.name} — {p.phone}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date *</label>
                <Input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required className="rounded-xl" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Time *</label>
                <Input type="time" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} required className="rounded-xl" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Doctor *</label>
                <Input value={formData.doctor} onChange={e => setFormData({ ...formData, doctor: e.target.value })} required className="rounded-xl" placeholder="Dr. Name" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</label>
                <select
                  className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                >
                  <option>Scheduled</option><option>Completed</option><option>Cancelled</option><option>No Show</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Treatment / Purpose</label>
              <Input value={formData.treatment} onChange={e => setFormData({ ...formData, treatment: e.target.value })} className="rounded-xl" placeholder="Cleaning, Filling, Root Canal..." />
            </div>
            <Button type="submit" disabled={createMut.isPending || updateMut.isPending} className="w-full rounded-xl h-11 text-sm font-semibold shadow-md">
              {createMut.isPending || updateMut.isPending ? "Saving..." : editingId ? "Save Changes" : "Book Appointment"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
