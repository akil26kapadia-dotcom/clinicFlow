import { Router, type IRouter, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

function requireAuth(req: Request, res: Response, next: any) {
  if (!(req.session as any).userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  next();
}

router.get("/settings", requireAuth, async (req: Request, res: Response) => {
  const userId = (req.session as any).userId;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  const { password: _, ...safeUser } = user;
  res.json(safeUser);
});

router.put("/settings", requireAuth, async (req: Request, res: Response) => {
  const userId = (req.session as any).userId;
  const { name, phone, clinicName, gstNumber, clinicAddress } = req.body;
  const [user] = await db.update(usersTable)
    .set({ name, phone, clinicName, gstNumber, clinicAddress })
    .where(eq(usersTable.id, userId))
    .returning();
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  const { password: _, ...safeUser } = user;
  res.json(safeUser);
});

export default router;
