import { useState } from "react";
import { useListInvoices, useDeleteInvoice, useGetInvoice } from "@workspace/api-client-react";
import { useGetSettings } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Printer, Trash2, Plus, FileText, Eye } from "lucide-react";
import { Link } from "wouter";

const statusColors: Record<string, string> = {
  "Paid": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Pending": "bg-rose-100 text-rose-700 border-rose-200",
  "Partial": "bg-amber-100 text-amber-700 border-amber-200",
};

function PrintModal({ invoiceId, onClose }: { invoiceId: number; onClose: () => void }) {
  const { data: inv } = useGetInvoice({ id: invoiceId });
  const { data: clinic } = useGetSettings();

  const handlePrint = () => {
    window.print();
  };

  if (!inv) return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-2xl p-8 text-muted-foreground">Loading invoice...</div>
    </div>
  );

  return (
    <>
      {/* Print-only styles */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          .print-modal-root { display: block !important; position: fixed; inset: 0; background: white; z-index: 9999; }
          .print-modal-controls { display: none !important; }
          .print-invoice { box-shadow: none !important; border: none !important; margin: 0 !important; max-width: 100% !important; }
        }
        @media screen {
          .print-modal-root { display: flex; }
        }
      `}</style>

      <div className="print-modal-root fixed inset-0 bg-black/50 backdrop-blur-sm z-50 items-center justify-center p-4">
        <div className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Controls */}
          <div className="print-modal-controls flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card z-10">
            <h2 className="font-bold text-lg">Invoice Preview</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onClose} className="rounded-lg">
                Close
              </Button>
              <Button size="sm" onClick={handlePrint} className="rounded-lg gap-2">
                <Printer size={15} /> Print
              </Button>
            </div>
          </div>

          {/* Invoice Body */}
          <div className="print-invoice p-8 space-y-8 bg-white rounded-b-2xl">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-4">
                {clinic?.logoUrl && (
                  <img src={clinic.logoUrl} alt="Logo" className="w-16 h-16 rounded-xl object-cover" />
                )}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{clinic?.clinicName || "Dental Clinic"}</h1>
                  {clinic?.clinicAddress && (
                    <p className="text-sm text-gray-500 mt-1 whitespace-pre-line max-w-[250px]">{clinic.clinicAddress}</p>
                  )}
                  {clinic?.phone && <p className="text-sm text-gray-500 mt-0.5">📞 {clinic.phone}</p>}
                  {clinic?.gstNumber && (
                    <p className="text-xs font-mono text-gray-500 mt-0.5">GSTIN: {clinic.gstNumber}</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="inline-block bg-blue-50 text-blue-700 px-4 py-1.5 rounded-xl font-bold text-lg">
                  INVOICE
                </div>
                <div className="mt-3 space-y-1">
                  <p className="text-lg font-bold text-gray-900">{inv.invoiceNumber}</p>
                  <p className="text-sm text-gray-500">Date: {new Date(inv.date).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${statusColors[inv.paymentStatus] || ""}`}>
                    {inv.paymentStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Patient Info */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Bill To</p>
              <p className="font-bold text-gray-900 text-lg">{inv.patientName}</p>
              {inv.paymentMethod && <p className="text-sm text-gray-500 mt-1">Payment: {inv.paymentMethod}</p>}
            </div>

            {/* Line Items */}
            <div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 text-gray-600 font-semibold">#</th>
                    <th className="text-left py-3 text-gray-600 font-semibold">Treatment / Service</th>
                    <th className="text-right py-3 text-gray-600 font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {(inv as any).items?.map((item: any, i: number) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="py-3 text-gray-400">{i + 1}</td>
                      <td className="py-3 text-gray-800 font-medium">{item.treatment}</td>
                      <td className="py-3 text-right text-gray-800 font-semibold">{formatCurrency(item.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-64 space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-semibold text-gray-800">{formatCurrency(inv.subtotal)}</span>
                </div>
                {Number(inv.discount) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Discount</span>
                    <span className="font-semibold text-rose-600">- {formatCurrency(Number(inv.discount))}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">GST @ 18%</span>
                  <span className="font-semibold text-gray-800">{formatCurrency((inv as any).gst || 0)}</span>
                </div>
                <div className="flex justify-between text-base font-bold border-t-2 border-gray-200 pt-3 mt-3">
                  <span className="text-gray-900">Total Amount</span>
                  <span className="text-blue-700 text-lg">{formatCurrency(inv.total)}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 pt-5 text-center">
              <p className="text-sm text-gray-500">Thank you for choosing {clinic?.clinicName || "our clinic"}!</p>
              <p className="text-xs text-gray-400 mt-1">This is a computer-generated invoice. No signature required.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function Invoices() {
  const queryClient = useQueryClient();
  const { data: invoices, isLoading } = useListInvoices({});
  const deleteMut = useDeleteInvoice({ onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/invoices"] }) });
  const [printInvoiceId, setPrintInvoiceId] = useState<number | null>(null);

  const handleDelete = (id: number, num: string) => {
    if (confirm(`Delete invoice ${num}? This cannot be undone.`)) {
      deleteMut.mutate({ id });
    }
  };

  return (
    <div className="space-y-5">
      {printInvoiceId && (
        <PrintModal invoiceId={printInvoiceId} onClose={() => setPrintInvoiceId(null)} />
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">Invoices</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">Billing history and records.</p>
        </div>
        <Link href="/billing">
          <Button className="rounded-xl shadow-md gap-2 w-full sm:w-auto">
            <Plus size={16} /> New Invoice
          </Button>
        </Link>
      </div>

      {/* Desktop Table */}
      <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden hidden sm:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-semibold">
              <tr>
                <th className="px-5 py-4">Invoice #</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Patient</th>
                <th className="px-5 py-4">Amount</th>
                <th className="px-5 py-4">Payment</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : invoices?.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No invoices yet.</td></tr>
              ) : invoices?.map((inv) => (
                <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-4 font-bold text-primary">{inv.invoiceNumber}</td>
                  <td className="px-5 py-4 text-muted-foreground">{new Date(inv.date).toLocaleDateString("en-IN")}</td>
                  <td className="px-5 py-4 font-medium text-foreground">{inv.patientName}</td>
                  <td className="px-5 py-4 font-bold">{formatCurrency(inv.total)}</td>
                  <td className="px-5 py-4 text-muted-foreground">{inv.paymentMethod}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusColors[inv.paymentStatus] || ""}`}>
                      {inv.paymentStatus}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg h-8 px-3 gap-1.5 text-xs"
                        onClick={() => setPrintInvoiceId(inv.id)}
                      >
                        <Eye size={13} /> View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg h-8 px-3 gap-1.5 text-xs"
                        onClick={() => setPrintInvoiceId(inv.id)}
                      >
                        <Printer size={13} /> Print
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(inv.id, inv.invoiceNumber)}
                        className="rounded-lg h-8 w-8 p-0 border-destructive/30 hover:bg-destructive/10"
                      >
                        <Trash2 size={13} className="text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Mobile Cards */}
      <div className="sm:hidden space-y-3">
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : invoices?.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FileText size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No invoices yet</p>
            <p className="text-sm mt-1">Create your first invoice from the billing page</p>
          </div>
        ) : invoices?.map((inv) => (
          <Card key={inv.id} className="rounded-2xl border-border/50 shadow-sm p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-bold text-primary text-base">{inv.invoiceNumber}</p>
                <p className="text-sm font-semibold text-foreground mt-0.5">{inv.patientName}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{new Date(inv.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">{formatCurrency(inv.total)}</p>
                <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusColors[inv.paymentStatus] || ""}`}>
                  {inv.paymentStatus}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-border/50 pt-3">
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-lg">{inv.paymentMethod}</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg h-8 gap-1.5 text-xs"
                  onClick={() => setPrintInvoiceId(inv.id)}
                >
                  <Printer size={13} /> Print
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(inv.id, inv.invoiceNumber)}
                  className="rounded-lg h-8 w-8 p-0 border-destructive/30 hover:bg-destructive/10"
                >
                  <Trash2 size={13} className="text-destructive" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
