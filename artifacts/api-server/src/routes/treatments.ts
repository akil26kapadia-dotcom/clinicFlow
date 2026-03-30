import { Router, type IRouter, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { treatmentsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/treatments", async (req: Request, res: Response) => {
  const treatments = await db.select().from(treatmentsTable).orderBy(treatmentsTable.name);
  res.json(treatments.map(t => ({ ...t, cost: Number(t.cost) })));
});

router.post("/treatments", async (req: Request, res: Response) => {
  const { name, cost, duration, description } = req.body;
  if (!name || cost === undefined) {
    res.status(400).json({ error: "Name and cost are required" });
    return;
  }
  const [treatment] = await db.insert(treatmentsTable).values({
    name, cost: String(cost), duration, description,
  }).returning();
  res.status(201).json({ ...treatment, cost: Number(treatment.cost) });
});

router.put("/treatments/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { name, cost, duration, description } = req.body;
  const [treatment] = await db.update(treatmentsTable)
    .set({ name, cost: String(cost), duration, description })
    .where(eq(treatmentsTable.id, id))
    .returning();
  if (!treatment) {
    res.status(404).json({ error: "Treatment not found" });
    return;
  }
  res.json({ ...treatment, cost: Number(treatment.cost) });
});

router.delete("/treatments/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  await db.delete(treatmentsTable).where(eq(treatmentsTable.id, id));
  res.json({ message: "Treatment deleted" });
});

export default router;
