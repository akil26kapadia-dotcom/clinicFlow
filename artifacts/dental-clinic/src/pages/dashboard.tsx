import { useGetDashboardStats, useGetRevenueChart, useGetAppointmentsChart } from "@workspace/api-client-react";
import { formatCurrency } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Calendar, Users, IndianRupee, AlertCircle, CheckCircle2, UserPlus } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from "recharts";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: revenueData, isLoading: revLoading } = useGetRevenueChart();
  const { data: aptData, isLoading: aptLoading } = useGetAppointmentsChart();

  if (statsLoading || revLoading || aptLoading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading dashboard...</div>;
  }

  const statCards = [
    { title: "Today's Appointments", value: stats?.todayAppointments || 0, icon: Calendar, color: "text-blue-500", bg: "bg-blue-50" },
    { title: "Total Patients", value: stats?.totalPatients || 0, icon: Users, color: "text-indigo-500", bg: "bg-indigo-50" },
    { title: "Monthly Revenue", value: formatCurrency(stats?.monthlyRevenue || 0), icon: IndianRupee, color: "text-emerald-500", bg: "bg-emerald-50" },
    { title: "Pending Payments", value: formatCurrency(stats?.pendingPayments || 0), icon: AlertCircle, color: "text-rose-500", bg: "bg-rose-50" },
    { title: "Completed Treatments", value: stats?.completedTreatments || 0, icon: CheckCircle2, color: "text-primary", bg: "bg-primary/10" },
    { title: "New Patients", value: stats?.newPatients || 0, icon: UserPlus, color: "text-amber-500", bg: "bg-amber-50" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, i) => (
          <Card key={i} className="p-6 border-border/50 shadow-md shadow-black/5 hover:shadow-lg transition-shadow duration-300 rounded-2xl flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${card.bg}`}>
              <card.icon className={`w-7 h-7 ${card.color}`} />
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground">{card.title}</p>
              <h3 className="text-2xl font-display font-bold text-foreground mt-1">{card.value}</h3>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 border-border/50 shadow-md shadow-black/5 rounded-2xl">
          <h3 className="text-lg font-display font-bold text-foreground mb-6">Revenue Overview</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData || []} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} tickFormatter={(value) => `₹${value/1000}k`} />
                <Tooltip cursor={{fill: '#F1F5F9'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 border-border/50 shadow-md shadow-black/5 rounded-2xl">
          <h3 className="text-lg font-display font-bold text-foreground mb-6">Appointments Trend</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={aptData || []} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} allowDecimals={false} />
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Line type="monotone" dataKey="value" stroke="hsl(var(--accent))" strokeWidth={4} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
