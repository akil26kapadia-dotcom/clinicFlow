import { Router, type IRouter, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { appointmentsTable, patientsTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";

const router: IRouter = Router();

router.get("/appointments", async (req: Request, res: Response) => {
  const { date, status } = req.query;
  const conditions: any[] = [];
  if (date) conditions.push(eq(appointmentsTable.date, date as string));
  if (status) conditions.push(eq(appointmentsTable.status, status as string));

  const appointments = await db
    .select({
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
    })
    .from(appointmentsTable)
    .leftJoin(patientsTable, eq(appointmentsTable.patientId, patientsTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(appointmentsTable.date, appointmentsTable.time);

  res.json(appointments);
});

router.post("/appointments", async (req: Request, res: Response) => {
  const { patientId, doctor, date, time, treatment, notes, status } = req.body;
  if (!patientId || !doctor || !date || !time) {
    res.status(400).json({ error: "Patient, doctor, date, and time are required" });
    return;
  }
  const [appointment] = await db.insert(appointmentsTable).values({
    patientId, doctor, date, time, treatment, notes, status: status || "Scheduled",
  }).returning();

  const [withPatient] = await db
    .select({
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
    })
    .from(appointmentsTable)
    .leftJoin(patientsTable, eq(appointmentsTable.patientId, patientsTable.id))
    .where(eq(appointmentsTable.id, appointment.id));

  res.status(201).json(withPatient);
});

router.put("/appointments/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { patientId, doctor, date, time, treatment, notes, status } = req.body;
  const [appointment] = await db.update(appointmentsTable)
    .set({ patientId, doctor, date, time, treatment, notes, status })
    .where(eq(appointmentsTable.id, id))
    .returning();

  if (!appointment) {
    res.status(404).json({ error: "Appointment not found" });
    return;
  }

  const [withPatient] = await db
    .select({
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
    })
    .from(appointmentsTable)
    .leftJoin(patientsTable, eq(appointmentsTable.patientId, patientsTable.id))
    .where(eq(appointmentsTable.id, id));

  res.json(withPatient);
});

router.delete("/appointments/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  await db.delete(appointmentsTable).where(eq(appointmentsTable.id, id));
  res.json({ message: "Appointment deleted" });
});

export default router;
