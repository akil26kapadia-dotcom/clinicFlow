import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useListPatients, useListTreatments, useCreateInvoice } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Plus, Trash2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Billing() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { data: patients } = useListPatients({});
  const { data: treatments } = useListTreatments();
  
  const [patientId, setPatientId] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentStatus, setPaymentStatus] = useState("Paid");
  const [discount, setDiscount] = useState<number>(0);
  
  const [items, setItems] = useState<{treatment: string, price: number}[]>([]);

  const { toast } = useToast();

  const createMut = useCreateInvoice({
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({ title: "Invoice created", description: `${data?.invoiceNumber || "Invoice"} has been saved successfully.` });
      setLocation("/invoices");
    },
    onError: () => toast({ title: "Invoice creation failed", description: "Please fill all fields and try again.", variant: "destructive" }),
  });

  const addItem = () => {
    setItems([...items, { treatment: "", price: 0 }]);
  };

  const updateItem = (index: number, field: 'treatment' | 'price', value: string | number) => {
    const newItems = [...items];
    if (field === 'treatment') {
      newItems[index].treatment = value as string;
      const t = treatments?.find(x => x.name === value);
      if (t) newItems[index].price = t.cost;
    } else {
      newItems[index].price = Number(value);
    }
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const { subtotal, gstAmount, total } = useMemo(() => {
    const sub = items.reduce((sum, item) => sum + item.price, 0);
    const afterDiscount = Math.max(0, sub - (discount || 0));
    const gst = afterDiscount * 0.18; // 18% GST in India
    return {
      subtotal: sub,
      gstAmount: gst,
      total: afterDiscount + gst
    };
  }, [items, discount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || items.length === 0) return alert("Select patient and add items.");
    
    createMut.mutate({
      data: {
        patientId,
        date: new Date().toISOString().split('T')[0],
        discount,
        paymentMethod,
        paymentStatus,
        items
      }
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Create Invoice</h1>
        <p className="text-muted-foreground mt-1">Generate a new bill for a patient.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6 rounded-2xl border-border/50 shadow-sm">
          <h3 className="text-lg font-bold mb-4 border-b pb-2">Invoice Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">Patient</label>
              <select 
                className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={patientId} onChange={e => setPatientId(Number(e.target.value))} required
              >
                <option value={0} disabled>Select a patient</option>
                {patients?.map(p => <option key={p.id} value={p.id}>{p.name} - {p.phone}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Payment Status</label>
                <select 
                  className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)}
                >
                  <option>Paid</option><option>Pending</option><option>Partial</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Method</label>
                <select 
                  className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}
                >
                  <option>Cash</option><option>Card</option><option>UPI</option><option>Net Banking</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 rounded-2xl border-border/50 shadow-sm">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h3 className="text-lg font-bold">Treatments / Services</h3>
            <Button type="button" variant="outline" size="sm" onClick={addItem} className="h-8 rounded-lg gap-1">
              <Plus size={14} /> Add Line Item
            </Button>
          </div>
          
          <div className="space-y-3">
            {items.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No items added. Click above to add services.</p>}
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-3 items-start">
                <div className="flex-1">
                  <select 
                    className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={item.treatment} onChange={e => updateItem(idx, 'treatment', e.target.value)} required
                  >
                    <option value="" disabled>Select treatment</option>
                    {treatments?.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                    <option value="Consultation">Consultation (Custom)</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="w-32">
                  <Input 
                    type="number" 
                    value={item.price} 
                    onChange={e => updateItem(idx, 'price', e.target.value)} 
                    placeholder="Price"
                    className="h-11 rounded-xl text-right"
                    required
                  />
                </div>
                <Button type="button" variant="outline" onClick={() => removeItem(idx)} className="h-11 w-11 p-0 rounded-xl text-destructive border-destructive/20 hover:bg-destructive/10">
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-4 border-t border-border flex justify-end">
            <div className="w-64 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold text-foreground">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Discount (₹)</span>
                <Input 
                  type="number" 
                  value={discount} 
                  onChange={e => setDiscount(Number(e.target.value))} 
                  className="w-24 h-8 rounded-lg text-right" 
                />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">GST (18%)</span>
                <span className="font-semibold text-foreground">{formatCurrency(gstAmount)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2 text-primary">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={createMut.isPending || items.length === 0} className="rounded-xl h-12 px-8 text-base shadow-lg shadow-primary/20">
            <Save className="mr-2" size={18} />
            Generate Invoice
          </Button>
        </div>
      </form>
    </div>
  );
}
