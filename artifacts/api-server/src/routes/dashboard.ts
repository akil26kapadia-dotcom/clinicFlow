import { Router, type IRouter, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { patientsTable, appointmentsTable, invoicesTable } from "@workspace/db/schema";
import { eq, sql, gte, and } from "drizzle-orm";

const router: IRouter = Router();

router.get("/dashboard/stats", async (req: Request, res: Response) => {
  const today = new Date().toISOString().slice(0, 10);
  const firstOfMonth = new Date();
  firstOfMonth.setDate(1);
  const monthStart = firstOfMonth.toISOString().slice(0, 10);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [totalPatientsResult] = await db.select({ count: sql<number>`count(*)` }).from(patientsTable);
  const totalPatients = Number(totalPatientsResult.count);

  const todayAppts = await db.select().from(appointmentsTable).where(eq(appointmentsTable.date, today));
  const todayAppointments = todayAppts.length;

  const monthInvoices = await db.select().from(invoicesTable)
    .where(and(
      gte(invoicesTable.date, monthStart),
      eq(invoicesTable.paymentStatus, "Paid")
    ));
  const monthlyRevenue = monthInvoices.reduce((sum, inv) => sum + Number(inv.total), 0);

  const pendingInvoices = await db.select().from(invoicesTable)
    .where(eq(invoicesTable.paymentStatus, "Pending"));
  const pendingPayments = pendingInvoices.reduce((sum, inv) => sum + Number(inv.total), 0);

  const completedAppts = await db.select().from(appointmentsTable)
    .where(eq(appointmentsTable.status, "Completed"));
  const completedTreatments = completedAppts.length;

  const newPatientRows = await db.select().from(patientsTable)
    .where(gte(patientsTable.createdAt, new Date(thirtyDaysAgo)));
  const newPatients = newPatientRows.length;

  res.json({
    todayAppointments,
    totalPatients,
    monthlyRevenue,
    pendingPayments,
    completedTreatments,
    newPatients,
  });
});

router.get("/dashboard/revenue-chart", async (req: Request, res: Response) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentYear = new Date().getFullYear();
  const invoices = await db.select().from(invoicesTable)
    .where(eq(invoicesTable.paymentStatus, "Paid"));

  const monthlyRevenue = new Array(12).fill(0);
  for (const inv of invoices) {
    const date = new Date(inv.date);
    if (date.getFullYear() === currentYear) {
      monthlyRevenue[date.getMonth()] += Number(inv.total);
    }
  }

  res.json(months.map((label, i) => ({ label, value: Math.round(monthlyRevenue[i]) })));
});

router.get("/dashboard/appointments-chart", async (req: Request, res: Response) => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const today = new Date();
  const startOfWeek = new Date(today);
  const day = today.getDay();
  const diff = (day === 0 ? -6 : 1 - day);
  startOfWeek.setDate(today.getDate() + diff);

  const counts = new Array(7).fill(0);
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    const rows = await db.select().from(appointmentsTable).where(eq(appointmentsTable.date, dateStr));
    counts[i] = rows.length;
  }

  res.json(days.map((label, i) => ({ label, value: counts[i] })));
});

export default router;
