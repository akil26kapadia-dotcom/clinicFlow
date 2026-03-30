import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  password: text("password").notNull(),
  role: text("role").notNull().default("admin"),
  clinicName: text("clinic_name").notNull(),
  gstNumber: text("gst_number"),
  clinicAddress: text("clinic_address"),
  logoUrl: text("logo_url"),
  primaryColor: text("primary_color").default("#2F80ED"),
  accentColor: text("accent_color").default("#27AE60"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
