import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { patientsTable } from "./patients";

export const appointmentsTable = pgTable("appointments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().default(1),
  patientId: integer("patient_id").notNull().references(() => patientsTable.id),
  doctor: text("doctor").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  treatment: text("treatment"),
  notes: text("notes"),
  status: text("status").notNull().default("Scheduled"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAppointmentSchema = createInsertSchema(appointmentsTable).omit({ id: true, createdAt: true });
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointmentsTable.$inferSelect;
