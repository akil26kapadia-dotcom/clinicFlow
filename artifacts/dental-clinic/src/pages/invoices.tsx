import { useState } from "react";
import { useListInvoices, useDeleteInvoice, useGetInvoice } from "@workspace/api-client-react";
import { useGetSettings } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Printer, Trash2, Plus, FileText, Eye, X } from "lucide-react";
import { Link } from "wouter";

const statusColors: Record<string, string> = {
  "Paid": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Pending": "bg-rose-100 text-rose-700 border-rose-200",
  "Partial": "bg-amber-100 text-amber-700 border-amber-200",
};

function PrintModal({ invoiceId, onClose }: { invoiceId: number; onClose: () => void }) {
  const { data: inv } = useGetInvoice({ id: invoiceId });
  const { data: clinic } = useGetSettings();

  const handlePrint = () => window.print();

  const gstTotal = Number((inv as any)?.gst || 0);
  const cgst = gstTotal / 2;
  const sgst = gstTotal / 2;
  const subtotal = Number(inv?.subtotal || 0);
  const discount = Number(inv?.discount || 0);
  const taxableAmount = subtotal - discount;

  if (!inv) return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-2xl p-8 text-muted-foreground">Loading invoice...</div>
    </div>
  );

  return (
    <>
      <style>{`
        @media print {
          body > * { display: none !important; }
          #print-invoice-root {
            display: block !important;
            position: fixed;
            inset: 0;
            background: white;
            z-index: 9999;
            padding: 0;
            margin: 0;
          }
          .no-print { display: none !important; }
          .print-page {
            padding: 24px 32px;
            max-width: 100% !important;
            box-shadow: none !important;
          }
        }
        @media screen {
          #print-invoice-root { display: flex; }
        }
      `}</style>

      <div id="print-invoice-root" className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">

          {/* Modal Controls */}
          <div className="no-print flex items-center justify-between px-5 py-3.5 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl z-10">
            <h2 className="font-bold text-base text-gray-800">Tax Invoice Preview</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onClose} className="rounded-lg gap-1.5">
                <X size={14} /> Close
              </Button>
              <Button size="sm" onClick={handlePrint} className="rounded-lg gap-1.5 bg-blue-600 hover:bg-blue-700 text-white">
                <Printer size={14} /> Print / Save PDF
              </Button>
            </div>
          </div>

          {/* Invoice Content */}
          <div className="print-page p-8 bg-white">

            {/* ── HEADER ── */}
            <div className="flex justify-between items-start mb-7">
              {/* Left: Clinic info */}
              <div className="flex items-start gap-4">
                {clinic?.logoUrl ? (
                  <img
                    src={clinic.logoUrl}
                    alt="Clinic Logo"
                    className="w-20 h-20 rounded-xl object-cover border border-gray-100 shadow-sm flex-shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold text-2xl">
                      {(clinic?.clinicName || "D").charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <h1 className="text-xl font-extrabold text-gray-900 leading-tight">
                    {clinic?.clinicName || "Dental Clinic"}
                  </h1>
                  {clinic?.clinicAddress && (
                    <p className="text-xs text-gray-500 mt-1 whitespace-pre-line leading-relaxed max-w-[220px]">
                      {clinic.clinicAddress}
                    </p>
                  )}
                  {clinic?.phone && (
                    <p className="text-xs text-gray-500 mt-1">Ph: {clinic.phone}</p>
                  )}
                  {clinic?.gstNumber && (
                    <div className="mt-1.5 inline-flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded text-xs font-mono text-gray-700">
                      GSTIN: {clinic.gstNumber}
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Invoice badge */}
              <div className="text-right">
                <div className="bg-blue-600 text-white px-5 py-2 rounded-xl font-extrabold text-base tracking-widest uppercase mb-3">
                  Tax Invoice
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-gray-400 text-xs">Invoice No.</span>
                    <span className="font-bold text-gray-900">{inv.invoiceNumber}</span>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-gray-400 text-xs">Date</span>
                    <span className="font-semibold text-gray-800">
                      {new Date(inv.date).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-2 mt-2">
                    <span className={`px-3 py-0.5 rounded-full text-xs font-bold border ${statusColors[inv.paymentStatus] || "bg-gray-100 text-gray-600"}`}>
                      {inv.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── DIVIDER ── */}
            <div className="border-t-2 border-blue-600 mb-6" />

            {/* ── BILL TO ── */}
            <div className="flex gap-8 mb-7">
              <div className="flex-1 bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Bill To</p>
                <p className="font-bold text-gray-900 text-base">{inv.patientName}</p>
                <p className="text-xs text-gray-500 mt-1">Patient</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 min-w-[160px]">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Payment Mode</p>
                <p className="font-semibold text-gray-800">{inv.paymentMethod || "Cash"}</p>
              </div>
            </div>

            {/* ── LINE ITEMS TABLE ── */}
            <table className="w-full text-sm mb-6 border border-gray-200 rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide w-10">#</th>
                  <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide">Treatment / Service</th>
                  <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wide">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {(inv as any).items?.length > 0 ? (
                  (inv as any).items.map((item: any, i: number) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                      <td className="px-4 py-3 text-gray-800 font-medium">{item.treatment}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-800">
                        {formatCurrency(Number(item.price))}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-4 py-4 text-center text-gray-400 text-xs">No items</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* ── TOTALS ── */}
            <div className="flex justify-end mb-7">
              <div className="w-72 border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="px-4 py-2.5 text-gray-500">Subtotal</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-gray-800">{formatCurrency(subtotal)}</td>
                    </tr>
                    {discount > 0 && (
                      <tr className="border-b border-gray-100">
                        <td className="px-4 py-2.5 text-gray-500">Discount</td>
                        <td className="px-4 py-2.5 text-right font-semibold text-rose-600">− {formatCurrency(discount)}</td>
                      </tr>
                    )}
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <td className="px-4 py-2.5 text-gray-600 font-medium">Taxable Amount</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-gray-800">{formatCurrency(taxableAmount)}</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="px-4 py-2 text-gray-500 text-xs">CGST @ 9%</td>
                      <td className="px-4 py-2 text-right text-gray-700 text-xs font-medium">{formatCurrency(cgst)}</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="px-4 py-2 text-gray-500 text-xs">SGST @ 9%</td>
                      <td className="px-4 py-2 text-right text-gray-700 text-xs font-medium">{formatCurrency(sgst)}</td>
                    </tr>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <td className="px-4 py-2.5 text-gray-600 font-medium">Total GST (18%)</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-gray-800">{formatCurrency(gstTotal)}</td>
                    </tr>
                    <tr className="bg-blue-600 text-white">
                      <td className="px-4 py-3.5 font-extrabold text-sm">Total Amount</td>
                      <td className="px-4 py-3.5 text-right font-extrabold text-base">{formatCurrency(Number(inv.total))}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── GST NOTE ── */}
            {clinic?.gstNumber && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-6 text-xs text-blue-800">
                <span className="font-semibold">Note:</span> All amounts are in Indian Rupees (₹). GST is charged as per applicable rate under GST Act, 2017.
                GSTIN of supplier: <span className="font-mono font-semibold">{clinic.gstNumber}</span>
              </div>
            )}

            {/* ── FOOTER ── */}
            <div className="border-t-2 border-blue-600 pt-5 text-center">
              <p className="text-sm font-semibold text-gray-700">
                Thank you for choosing {clinic?.clinicName || "our clinic"}!
              </p>
              <p className="text-xs text-gray-400 mt-1">
                This is a computer-generated Tax Invoice. No signature required. Valid without physical signature.
              </p>
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
          <p className="text-muted-foreground mt-0.5 text-sm">Billing history and GST records.</p>
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
                <th className="px-5 py-4">Subtotal</th>
                <th className="px-5 py-4">GST (18%)</th>
                <th className="px-5 py-4">Total</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : invoices?.length === 0 ? (
                <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">No invoices yet.</td></tr>
              ) : invoices?.map((inv) => (
                <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-4 font-bold text-primary">{inv.invoiceNumber}</td>
                  <td className="px-5 py-4 text-muted-foreground">{new Date(inv.date).toLocaleDateString("en-IN")}</td>
                  <td className="px-5 py-4 font-medium text-foreground">{inv.patientName}</td>
                  <td className="px-5 py-4 text-muted-foreground">{formatCurrency(Number(inv.subtotal))}</td>
                  <td className="px-5 py-4 text-muted-foreground">{formatCurrency(Number((inv as any).gst || 0))}</td>
                  <td className="px-5 py-4 font-bold">{formatCurrency(inv.total)}</td>
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
                <p className="text-xs text-muted-foreground mt-0.5">
                  {new Date(inv.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">{formatCurrency(inv.total)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">GST: {formatCurrency(Number((inv as any).gst || 0))}</p>
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
                  <Eye size={13} /> View
                </Button>
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
