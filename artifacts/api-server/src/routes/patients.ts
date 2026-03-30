import { Router, type IRouter, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { patientsTable, appointmentsTable, invoicesTable } from "@workspace/db/schema";
import { eq, ilike, or } from "drizzle-orm";

const router: IRouter = Router();

router.get("/patients", async (req: Request, res: Response) => {
  const { search } = req.query;
  let query = db.select().from(patientsTable);
  if (search) {
    const patients = await db.select().from(patientsTable).where(
      or(
        ilike(patientsTable.name, `%${search}%`),
        ilike(patientsTable.phone, `%${search}%`),
      )
    );
    res.json(patients);
    return;
  }
  const patients = await query.orderBy(patientsTable.createdAt);
  res.json(patients);
});

router.post("/patients", async (req: Request, res: Response) => {
  const { name, phone, email, address, age, gender, medicalHistory, notes, firstVisit } = req.body;
  if (!name || !phone) {
    res.status(400).json({ error: "Name and phone are required" });
    return;
  }
  const [patient] = await db.insert(patientsTable).values({
    name, phone, email, address, age, gender, medicalHistory, notes, firstVisit,
  }).returning();
  res.status(201).json(patient);
});

router.get("/patients/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const [patient] = await db.select().from(patientsTable).where(eq(patientsTable.id, id));
  if (!patient) {
    res.status(404).json({ error: "Patient not found" });
    return;
  }
  const appointments = await db.select().from(appointmentsTable).where(eq(appointmentsTable.patientId, id));
  const invoices = await db.select().from(invoicesTable).where(eq(invoicesTable.patientId, id));
  res.json({ ...patient, appointments, invoices });
});

router.put("/patients/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { name, phone, email, address, age, gender, medicalHistory, notes, firstVisit } = req.body;
  const [patient] = await db.update(patientsTable)
    .set({ name, phone, email, address, age, gender, medicalHistory, notes, firstVisit })
    .where(eq(patientsTable.id, id))
    .returning();
  if (!patient) {
    res.status(404).json({ error: "Patient not found" });
    return;
  }
  res.json(patient);
});

router.delete("/patients/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  await db.delete(patientsTable).where(eq(patientsTable.id, id));
  res.json({ message: "Patient deleted" });
});

export default router;
