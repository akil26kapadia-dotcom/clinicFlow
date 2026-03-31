import { Router, type IRouter, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { patientsTable, appointmentsTable, invoicesTable } from "@workspace/db/schema";
import { eq, ilike, or, and } from "drizzle-orm";

const router: IRouter = Router();

function requireAuth(req: Request, res: Response): number | null {
  const userId = (req.session as any).userId;
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return null;
  }
  return userId;
}

router.get("/patients", async (req: Request, res: Response) => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const { search } = req.query;
  if (search) {
    const patients = await db.select().from(patientsTable).where(
      and(
        eq(patientsTable.userId, userId),
        or(
          ilike(patientsTable.name, `%${search}%`),
          ilike(patientsTable.phone, `%${search}%`),
        )
      )
    );
    res.json(patients);
    return;
  }
  const patients = await db.select().from(patientsTable)
    .where(eq(patientsTable.userId, userId))
    .orderBy(patientsTable.createdAt);
  res.json(patients);
});

router.post("/patients", async (req: Request, res: Response) => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const { name, phone, email, address, age, gender, medicalHistory, notes, firstVisit } = req.body;
  if (!name || !phone) {
    res.status(400).json({ error: "Name and phone are required" });
    return;
  }
  const [patient] = await db.insert(patientsTable).values({
    userId, name, phone, email, address, age, gender, medicalHistory, notes, firstVisit,
  }).returning();
  res.status(201).json(patient);
});

router.get("/patients/:id", async (req: Request, res: Response) => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const id = parseInt(req.params.id);
  const [patient] = await db.select().from(patientsTable)
    .where(and(eq(patientsTable.id, id), eq(patientsTable.userId, userId)));
  if (!patient) {
    res.status(404).json({ error: "Patient not found" });
    return;
  }
  const appointments = await db.select().from(appointmentsTable)
    .where(and(eq(appointmentsTable.patientId, id), eq(appointmentsTable.userId, userId)));
  const invoices = await db.select().from(invoicesTable)
    .where(and(eq(invoicesTable.patientId, id), eq(invoicesTable.userId, userId)));
  res.json({ ...patient, appointments, invoices });
});

router.put("/patients/:id", async (req: Request, res: Response) => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const id = parseInt(req.params.id);
  const { name, phone, email, address, age, gender, medicalHistory, notes, firstVisit } = req.body;
  const [patient] = await db.update(patientsTable)
    .set({ name, phone, email, address, age, gender, medicalHistory, notes, firstVisit })
    .where(and(eq(patientsTable.id, id), eq(patientsTable.userId, userId)))
    .returning();
  if (!patient) {
    res.status(404).json({ error: "Patient not found" });
    return;
  }
  res.json(patient);
});

router.delete("/patients/:id", async (req: Request, res: Response) => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const id = parseInt(req.params.id);
  await db.delete(patientsTable)
    .where(and(eq(patientsTable.id, id), eq(patientsTable.userId, userId)));
  res.json({ message: "Patient deleted" });
});

export default router;
