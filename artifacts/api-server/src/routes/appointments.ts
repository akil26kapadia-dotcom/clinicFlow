import { Router, type IRouter, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { appointmentsTable, patientsTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";

const router: IRouter = Router();

function requireAuth(req: Request, res: Response): number | null {
  const userId = (req.session as any).userId;
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return null;
  }
  return userId;
}

const aptSelect = {
  id: appointmentsTable.id,
  patientId: appointmentsTable.patientId,
  patientName: patientsTable.name,
  doctor: appointmentsTable.doctor,
  date: appointmentsTable.date,
  time: appointmentsTable.time,
  treatment: appointmentsTable.treatment,
  notes: appointmentsTable.notes,
  status: appointmentsTable.status,
  createdAt: appointmentsTable.createdAt,
};

router.get("/appointments", async (req: Request, res: Response) => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const { date, status } = req.query;
  const conditions: any[] = [eq(appointmentsTable.userId, userId)];
  if (date) conditions.push(eq(appointmentsTable.date, date as string));
  if (status) conditions.push(eq(appointmentsTable.status, status as string));

  const appointments = await db
    .select(aptSelect)
    .from(appointmentsTable)
    .leftJoin(patientsTable, eq(appointmentsTable.patientId, patientsTable.id))
    .where(and(...conditions))
    .orderBy(appointmentsTable.date, appointmentsTable.time);

  res.json(appointments);
});

router.post("/appointments", async (req: Request, res: Response) => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const { patientId, doctor, date, time, treatment, notes, status } = req.body;
  if (!patientId || !doctor || !date || !time) {
    res.status(400).json({ error: "Patient, doctor, date, and time are required" });
    return;
  }
  const [appointment] = await db.insert(appointmentsTable).values({
    userId, patientId, doctor, date, time, treatment, notes, status: status || "Scheduled",
  }).returning();

  const [withPatient] = await db
    .select(aptSelect)
    .from(appointmentsTable)
    .leftJoin(patientsTable, eq(appointmentsTable.patientId, patientsTable.id))
    .where(eq(appointmentsTable.id, appointment.id));

  res.status(201).json(withPatient);
});

router.put("/appointments/:id", async (req: Request, res: Response) => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const id = parseInt(req.params.id);
  const { patientId, doctor, date, time, treatment, notes, status } = req.body;
  const [appointment] = await db.update(appointmentsTable)
    .set({ patientId, doctor, date, time, treatment, notes, status })
    .where(and(eq(appointmentsTable.id, id), eq(appointmentsTable.userId, userId)))
    .returning();

  if (!appointment) {
    res.status(404).json({ error: "Appointment not found" });
    return;
  }

  const [withPatient] = await db
    .select(aptSelect)
    .from(appointmentsTable)
    .leftJoin(patientsTable, eq(appointmentsTable.patientId, patientsTable.id))
    .where(eq(appointmentsTable.id, id));

  res.json(withPatient);
});

router.delete("/appointments/:id", async (req: Request, res: Response) => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const id = parseInt(req.params.id);
  await db.delete(appointmentsTable)
    .where(and(eq(appointmentsTable.id, id), eq(appointmentsTable.userId, userId)));
  res.json({ message: "Appointment deleted" });
});

export default router;
