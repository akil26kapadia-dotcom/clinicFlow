import { Router, type IRouter, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.post("/auth/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Email and password required" });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  (req.session as any).userId = user.id;
  const { password: _, ...safeUser } = user;
  res.json({ user: safeUser, message: "Login successful" });
});

router.post("/auth/logout", (req: Request, res: Response) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out" });
  });
});

router.get("/auth/me", async (req: Request, res: Response) => {
  const userId = (req.session as any).userId;
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }
  const { password: _, ...safeUser } = user;
  res.json(safeUser);
});

router.post("/auth/register", async (req: Request, res: Response) => {
  const { name, email, password, phone, clinicName, gstNumber } = req.body;
  if (!name || !email || !password || !clinicName) {
    res.status(400).json({ error: "Name, email, password, and clinic name are required" });
    return;
  }
  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing.length > 0) {
    res.status(400).json({ error: "Email already registered" });
    return;
  }
  const hashed = await bcrypt.hash(password, 10);
  const [user] = await db.insert(usersTable).values({
    name,
    email,
    password: hashed,
    phone,
    clinicName,
    gstNumber,
    role: "admin",
  }).returning();
  (req.session as any).userId = user.id;
  const { password: _, ...safeUser } = user;
  res.status(201).json({ user: safeUser, message: "Registration successful" });
});

export default router;
