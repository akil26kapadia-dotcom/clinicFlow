import { useGetDailyRevenue, useGetPendingPayments, useGetTopTreatments } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { FileText, IndianRupee, AlertCircle } from "lucide-react";

export default function Reports() {
  const { data: daily } = useGetDailyRevenue({ date: new Date().toISOString().split('T')[0] });
  const { data: pending } = useGetPendingPayments();
  const { data: treatments } = useGetTopTreatments();

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', '#F59E0B', '#8B5CF6', '#EC4899'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Clinic Reports</h1>
        <p className="text-muted-foreground mt-1">Analytics and financial summaries.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg shadow-primary/20">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white/80 font-medium mb-1">Today's Revenue</p>
              <h3 className="text-3xl font-bold">{formatCurrency(daily?.totalRevenue || 0)}</h3>
            </div>
            <IndianRupee className="opacity-50" size={32} />
          </div>
          <div className="mt-4 pt-4 border-t border-white/20 flex justify-between text-sm">
            <span>{daily?.totalInvoices || 0} Invoices</span>
            <span>Collected: {formatCurrency(daily?.paidAmount || 0)}</span>
          </div>
        </Card>

        <Card className="p-6 rounded-2xl border-border/50 shadow-sm col-span-1 md:col-span-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center">
              <AlertCircle size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Pending Payments</h3>
              <p className="text-muted-foreground">Outstanding invoices to be collected</p>
            </div>
          </div>
          <div className="text-right">
            <h3 className="text-2xl font-bold text-rose-600">
              {formatCurrency(pending?.reduce((a, b) => a + b.total, 0) || 0)}
            </h3>
            <p className="text-sm text-muted-foreground">{pending?.length || 0} bills pending</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 rounded-2xl border-border/50 shadow-sm">
          <h3 className="text-lg font-display font-bold mb-6">Top Treatments by Revenue</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={treatments || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="revenue"
                  nameKey="treatment"
                >
                  {treatments?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-0 rounded-2xl border-border/50 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border/50 bg-muted/20">
            <h3 className="text-lg font-display font-bold">Recent Pending Invoices</h3>
          </div>
          <div className="divide-y divide-border/50 max-h-72 overflow-y-auto">
            {pending?.length === 0 ? (
              <p className="p-6 text-center text-muted-foreground">All clear! No pending payments.</p>
            ) : pending?.slice(0, 5).map(inv => (
              <div key={inv.id} className="p-4 px-6 flex justify-between items-center hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <FileText className="text-muted-foreground" size={18} />
                  <div>
                    <p className="font-semibold text-foreground">{inv.patientName}</p>
                    <p className="text-xs text-muted-foreground">Inv: {inv.invoiceNumber} | {new Date(inv.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="font-bold text-rose-600">{formatCurrency(inv.total)}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
