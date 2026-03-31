import { Router, type IRouter, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { treatmentsTable } from "@workspace/db/schema";
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

router.get("/treatments", async (req: Request, res: Response) => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const treatments = await db.select().from(treatmentsTable)
    .where(eq(treatmentsTable.userId, userId))
    .orderBy(treatmentsTable.name);
  res.json(treatments.map(t => ({ ...t, cost: Number(t.cost) })));
});

router.post("/treatments", async (req: Request, res: Response) => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const { name, cost, duration, description } = req.body;
  if (!name || cost === undefined) {
    res.status(400).json({ error: "Name and cost are required" });
    return;
  }
  const [treatment] = await db.insert(treatmentsTable).values({
    userId, name, cost: String(cost), duration, description,
  }).returning();
  res.status(201).json({ ...treatment, cost: Number(treatment.cost) });
});

router.put("/treatments/:id", async (req: Request, res: Response) => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const id = parseInt(req.params.id);
  const { name, cost, duration, description } = req.body;
  const [treatment] = await db.update(treatmentsTable)
    .set({ name, cost: String(cost), duration, description })
    .where(and(eq(treatmentsTable.id, id), eq(treatmentsTable.userId, userId)))
    .returning();
  if (!treatment) {
    res.status(404).json({ error: "Treatment not found" });
    return;
  }
  res.json({ ...treatment, cost: Number(treatment.cost) });
});

router.delete("/treatments/:id", async (req: Request, res: Response) => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const id = parseInt(req.params.id);
  await db.delete(treatmentsTable)
    .where(and(eq(treatmentsTable.id, id), eq(treatmentsTable.userId, userId)));
  res.json({ message: "Treatment deleted" });
});

export default router;
