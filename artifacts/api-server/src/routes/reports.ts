import { Router, type IRouter, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { invoicesTable, invoiceItemsTable, patientsTable } from "@workspace/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";

const router: IRouter = Router();

async function getInvoicesWithPatients(conditions: any[]) {
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
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(invoicesTable.createdAt));

  return rows.map(r => ({
    ...r,
    subtotal: Number(r.subtotal),
    discount: Number(r.discount),
    gst: Number(r.gst),
    total: Number(r.total),
  }));
}

router.get("/reports/daily-revenue", async (req: Request, res: Response) => {
  const date = (req.query.date as string) || new Date().toISOString().slice(0, 10);
  const invoices = await getInvoicesWithPatients([eq(invoicesTable.date, date)]);
  const paid = invoices.filter(i => i.paymentStatus === "Paid");
  const pending = invoices.filter(i => i.paymentStatus === "Pending");
  res.json({
    totalRevenue: paid.reduce((s, i) => s + i.total, 0),
    totalInvoices: invoices.length,
    paidAmount: paid.reduce((s, i) => s + i.total, 0),
    pendingAmount: pending.reduce((s, i) => s + i.total, 0),
    invoices,
  });
});

router.get("/reports/monthly-revenue", async (req: Request, res: Response) => {
  const now = new Date();
  const month = parseInt((req.query.month as string) || String(now.getMonth() + 1));
  const year = parseInt((req.query.year as string) || String(now.getFullYear()));
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, "0")}-${lastDay}`;

  const invoices = await getInvoicesWithPatients([
    gte(invoicesTable.date, startDate),
    lte(invoicesTable.date, endDate),
  ]);
  const paid = invoices.filter(i => i.paymentStatus === "Paid");
  const pending = invoices.filter(i => i.paymentStatus === "Pending");
  res.json({
    totalRevenue: paid.reduce((s, i) => s + i.total, 0),
    totalInvoices: invoices.length,
    paidAmount: paid.reduce((s, i) => s + i.total, 0),
    pendingAmount: pending.reduce((s, i) => s + i.total, 0),
    invoices,
  });
});

router.get("/reports/pending-payments", async (req: Request, res: Response) => {
  const invoices = await getInvoicesWithPatients([eq(invoicesTable.paymentStatus, "Pending")]);
  res.json(invoices);
});

router.get("/reports/top-treatments", async (req: Request, res: Response) => {
  const items = await db.select().from(invoiceItemsTable);
  const stats = new Map<string, { count: number; revenue: number }>();
  for (const item of items) {
    const existing = stats.get(item.treatment) || { count: 0, revenue: 0 };
    stats.set(item.treatment, {
      count: existing.count + 1,
      revenue: existing.revenue + Number(item.price),
    });
  }
  const result = Array.from(stats.entries())
    .map(([treatment, data]) => ({ treatment, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  res.json(result);
});

export default router;
