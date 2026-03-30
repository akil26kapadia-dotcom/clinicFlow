import { Router, type IRouter, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { staffTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/staff", async (req: Request, res: Response) => {
  const staff = await db.select().from(staffTable).orderBy(staffTable.name);
  res.json(staff.map(s => ({ ...s, salary: s.salary ? Number(s.salary) : null })));
});

router.post("/staff", async (req: Request, res: Response) => {
  const { name, role, phone, email, specialization, joiningDate, salary, status } = req.body;
  if (!name || !role) {
    res.status(400).json({ error: "Name and role are required" });
    return;
  }
  const [staff] = await db.insert(staffTable).values({
    name, role, phone, email, specialization, joiningDate,
    salary: salary !== undefined ? String(salary) : null,
    status: status || "Active",
  }).returning();
  res.status(201).json({ ...staff, salary: staff.salary ? Number(staff.salary) : null });
});

router.put("/staff/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { name, role, phone, email, specialization, joiningDate, salary, status } = req.body;
  const [staff] = await db.update(staffTable)
    .set({
      name, role, phone, email, specialization, joiningDate,
      salary: salary !== undefined ? String(salary) : null,
      status,
    })
    .where(eq(staffTable.id, id))
    .returning();
  if (!staff) {
    res.status(404).json({ error: "Staff not found" });
    return;
  }
  res.json({ ...staff, salary: staff.salary ? Number(staff.salary) : null });
});

router.delete("/staff/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  await db.delete(staffTable).where(eq(staffTable.id, id));
  res.json({ message: "Staff member deleted" });
});

export default router;
