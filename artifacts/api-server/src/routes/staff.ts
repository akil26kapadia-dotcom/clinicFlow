import { Router, type IRouter, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { staffTable } from "@workspace/db/schema";
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

const fmt = (s: any) => ({ ...s, salary: s.salary ? Number(s.salary) : 0 });

router.get("/staff", async (req: Request, res: Response) => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const staff = await db.select().from(staffTable)
    .where(eq(staffTable.userId, userId))
    .orderBy(staffTable.name);
  res.json(staff.map(fmt));
});

router.post("/staff", async (req: Request, res: Response) => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const { name, role, phone, email, specialization, joiningDate, salary, status } = req.body;
  if (!name || !role) {
    res.status(400).json({ error: "Name and role are required" });
    return;
  }
  const [staff] = await db.insert(staffTable).values({
    userId, name, role, phone, email, specialization, joiningDate,
    salary: salary !== undefined ? String(salary) : null,
    status: status || "Active",
  }).returning();
  res.status(201).json(fmt(staff));
});

router.put("/staff/:id", async (req: Request, res: Response) => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const id = parseInt(req.params.id);
  const { name, role, phone, email, specialization, joiningDate, salary, status } = req.body;
  const [staff] = await db.update(staffTable)
    .set({
      name, role, phone, email, specialization, joiningDate,
      salary: salary !== undefined ? String(salary) : null,
      status,
    })
    .where(and(eq(staffTable.id, id), eq(staffTable.userId, userId)))
    .returning();
  if (!staff) {
    res.status(404).json({ error: "Staff not found" });
    return;
  }
  res.json(fmt(staff));
});

router.delete("/staff/:id", async (req: Request, res: Response) => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const id = parseInt(req.params.id);
  await db.delete(staffTable)
    .where(and(eq(staffTable.id, id), eq(staffTable.userId, userId)));
  res.json({ message: "Staff member deleted" });
});

export default router;
