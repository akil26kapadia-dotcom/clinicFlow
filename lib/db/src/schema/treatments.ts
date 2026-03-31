import { pgTable, serial, text, numeric, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const treatmentsTable = pgTable("treatments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().default(1),
  name: text("name").notNull(),
  cost: numeric("cost", { precision: 10, scale: 2 }).notNull(),
  duration: integer("duration"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTreatmentSchema = createInsertSchema(treatmentsTable).omit({ id: true, createdAt: true });
export type InsertTreatment = z.infer<typeof insertTreatmentSchema>;
export type Treatment = typeof treatmentsTable.$inferSelect;
