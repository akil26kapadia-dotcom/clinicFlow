import { Router, type IRouter, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { invoicesTable, invoiceItemsTable, patientsTable } from "@workspace/db/schema";
import { eq, desc, and } from "drizzle-orm";

const router: IRouter = Router();

function requireAuth(req: Request, res: Response): number | null {
  const userId = (req.session as any).userId;
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return null;
  }
  return userId;
}

function formatInvoice(inv: any) {
  return {
    ...inv,
    subtotal: Number(inv.subtotal),
    discount: Number(inv.discount),
    gst: Number(inv.gst),
    total: Number(inv.total),
  };
}

async function getNextInvoiceNumber(userId: number): Promise<string> {
  const last = await db.select().from(invoicesTable)
    .where(eq(invoicesTable.userId, userId))
    .orderBy(desc(invoicesTable.id))
    .limit(1);
  if (last.length === 0) return "INV-001";
  const lastNum = parseInt(last[0].invoiceNumber.replace("INV-", ""), 10);
  return `INV-${String(lastNum + 1).padStart(3, "0")}`;
}

router.get("/invoices", async (req: Request, res: Response) => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const { status } = req.query;
  const conditions: any[] = [eq(invoicesTable.userId, userId)];
  if (status) conditions.push(eq(invoicesTable.paymentStatus, status as string));

  const rows = await db
    .select({
      id: invoicesTable.id,
      invoiceNumber: invoicesTable.invoiceNumber,
      patientId: invoicesTable.patientId,
      patientName: patientsTable.name,
      date: invoicesTable.date,
      subtotal: invoicesTable.subtotal,
      discount: invoicesTable.discount,
      gst: invoicesTable.gst,
      total: invoicesTable.total,
      paymentMethod: invoicesTable.paymentMethod,
      paymentStatus: invoicesTable.paymentStatus,
      createdAt: invoicesTable.createdAt,
    })
    .from(invoicesTable)
    .leftJoin(patientsTable, eq(invoicesTable.patientId, patientsTable.id))
    .where(and(...conditions))
    .orderBy(desc(invoicesTable.createdAt));

  res.json(rows.map(formatInvoice));
});

router.post("/invoices", async (req: Request, res: Response) => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const { patientId, date, discount = 0, paymentMethod, paymentStatus, items } = req.body;
  if (!patientId || !items || items.length === 0) {
    res.status(400).json({ error: "Patient and items are required" });
    return;
  }
  const invoiceDate = date || new Date().toISOString().slice(0, 10);
  const subtotal = items.reduce((sum: number, item: any) => sum + Number(item.price), 0);
  const discountAmt = Number(discount) || 0;
  const taxableAmount = subtotal - discountAmt;
  const gst = Math.round(taxableAmount * 0.18 * 100) / 100;
  const total = Math.round((taxableAmount + gst) * 100) / 100;
  const invoiceNumber = await getNextInvoiceNumber(userId);

  const [invoice] = await db.insert(invoicesTable).values({
    userId,
    invoiceNumber,
    patientId,
    date: invoiceDate,
    subtotal: String(subtotal),
    discount: String(discountAmt),
    gst: String(gst),
    total: String(total),
    paymentMethod: paymentMethod || "Cash",
    paymentStatus: paymentStatus || "Pending",
  }).returning();

  await db.insert(invoiceItemsTable).values(
    items.map((item: any) => ({
      invoiceId: invoice.id,
      treatment: item.treatment,
      price: String(item.price),
    }))
  );

  const [patient] = await db.select().from(patientsTable).where(eq(patientsTable.id, patientId));
  res.status(201).json(formatInvoice({ ...invoice, patientName: patient?.name }));
});

router.get("/invoices/:id", async (req: Request, res: Response) => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const id = parseInt(req.params.id);
  const [invoice] = await db
    .select({
      id: invoicesTable.id,
      invoiceNumber: invoicesTable.invoiceNumber,
      patientId: invoicesTable.patientId,
      patientName: patientsTable.name,
      date: invoicesTable.date,
      subtotal: invoicesTable.subtotal,
      discount: invoicesTable.discount,
      gst: invoicesTable.gst,
      total: invoicesTable.total,
      paymentMethod: invoicesTable.paymentMethod,
      paymentStatus: invoicesTable.paymentStatus,
      createdAt: invoicesTable.createdAt,
    })
    .from(invoicesTable)
    .leftJoin(patientsTable, eq(invoicesTable.patientId, patientsTable.id))
    .where(and(eq(invoicesTable.id, id), eq(invoicesTable.userId, userId)));

  if (!invoice) {
    res.status(404).json({ error: "Invoice not found" });
    return;
  }

  const invoiceItems = await db.select().from(invoiceItemsTable)
    .where(eq(invoiceItemsTable.invoiceId, id));

  res.json({
    ...formatInvoice(invoice),
    items: invoiceItems.map(item => ({ ...item, price: Number(item.price) })),
  });
});

router.put("/invoices/:id", async (req: Request, res: Response) => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const id = parseInt(req.params.id);
  const { paymentMethod, paymentStatus, discount } = req.body;
  const updateData: any = {};
  if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;
  if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;

  if (discount !== undefined) {
    const [existing] = await db.select().from(invoicesTable)
      .where(and(eq(invoicesTable.id, id), eq(invoicesTable.userId, userId)));
    if (existing) {
      const sub = Number(existing.subtotal);
      const disc = Number(discount);
      const taxable = sub - disc;
      const gst = Math.round(taxable * 0.18 * 100) / 100;
      const total = Math.round((taxable + gst) * 100) / 100;
      updateData.discount = String(disc);
      updateData.gst = String(gst);
      updateData.total = String(total);
    }
  }

  const [invoice] = await db.update(invoicesTable)
    .set(updateData)
    .where(and(eq(invoicesTable.id, id), eq(invoicesTable.userId, userId)))
    .returning();

  if (!invoice) {
    res.status(404).json({ error: "Invoice not found" });
    return;
  }

  const [patient] = await db.select().from(patientsTable)
    .where(eq(patientsTable.id, invoice.patientId));
  res.json(formatInvoice({ ...invoice, patientName: patient?.name }));
});

router.delete("/invoices/:id", async (req: Request, res: Response) => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const id = parseInt(req.params.id);
  await db.delete(invoicesTable)
    .where(and(eq(invoicesTable.id, id), eq(invoicesTable.userId, userId)));
  res.json({ message: "Invoice deleted" });
});

export default router;
