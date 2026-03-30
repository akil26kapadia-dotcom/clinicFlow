import { useListInvoices, useDeleteInvoice } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Printer, Trash2, Eye } from "lucide-react";
import { Link } from "wouter";

export default function Invoices() {
  const queryClient = useQueryClient();
  const { data: invoices, isLoading } = useListInvoices({});
  const deleteMut = useDeleteInvoice({ onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/invoices"] }) });

  const statusColors: Record<string, string> = {
    "Paid": "bg-emerald-100 text-emerald-700",
    "Pending": "bg-rose-100 text-rose-700",
    "Partial": "bg-amber-100 text-amber-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Invoices</h1>
          <p className="text-muted-foreground mt-1">Billing history and records.</p>
        </div>
        <Link href="/billing">
          <Button className="rounded-xl shadow-md">Create New Invoice</Button>
        </Link>
      </div>

      <Card className="rounded-2xl border-border/50 shadow-md shadow-black/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-semibold">
              <tr>
                <th className="px-6 py-4">Invoice #</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Patient</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : invoices?.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No invoices generated yet.</td></tr>
              ) : invoices?.map((inv) => (
                <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-bold text-foreground">{inv.invoiceNumber}</td>
                  <td className="px-6 py-4">{new Date(inv.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-medium">{inv.patientName}</td>
                  <td className="px-6 py-4 font-semibold">{formatCurrency(inv.total)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusColors[inv.paymentStatus]}`}>
                      {inv.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Button variant="outline" size="sm" className="rounded-lg h-8 px-2" onClick={() => alert('Print feature in development')}>
                      <Printer size={14} className="mr-1" /> Print
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => deleteMut.mutate({ id: inv.id })} className="rounded-lg h-8 w-8 p-0 border-destructive/30 hover:bg-destructive/10">
                      <Trash2 size={14} className="text-destructive" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
