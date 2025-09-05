import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  role: text("role").default("user").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  email: true,
  phone: true,
  role: true,
});

// Service schema
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  features: jsonb("features").notNull(),
});

export const insertServiceSchema = createInsertSchema(services).pick({
  title: true,
  description: true,
  icon: true,
  features: true,
});

// Training Program schema
export const trainingPrograms = pgTable("training_programs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(), // SEO-friendly URL slug
  description: text("description").notNull(),
  category: text("category").notNull(),
  duration: text("duration").notNull(),
  price: integer("price").notNull(), // Keep for backward compatibility (will be online_price)
  online_price: integer("online_price"),
  offline_price: integer("offline_price"),
  delivery_mode: text("delivery_mode").default("both").notNull(), // 'online', 'offline', 'both'
  image_path: text("image_path"),
});

export const insertTrainingProgramSchema = createInsertSchema(trainingPrograms).pick({
  title: true,
  slug: true,
  description: true,
  category: true,
  duration: true,
  price: true,
  online_price: true,
  offline_price: true,
  delivery_mode: true,
  image_path: true,
});

// Participant schema
export const participants = pgTable("participants", {
  id: serial("id").primaryKey(),
  participantId: text("participant_id").notNull().unique(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  trainingProgramId: integer("training_program_id").notNull(),
  enrollmentDate: timestamp("enrollment_date").notNull(),
  status: text("status").default("active").notNull(),
});

export const insertParticipantSchema = createInsertSchema(participants).pick({
  participantId: true,
  fullName: true,
  email: true,
  phone: true,
  trainingProgramId: true,
  enrollmentDate: true,
  status: true,
});

// Certificate schema
export const certificates = pgTable("certificates", {
  id: serial("id").primaryKey(),
  certificateId: text("certificate_id").notNull().unique(),
  participantId: integer("participant_id").notNull(),
  trainingProgramId: integer("training_program_id").notNull(),
  issueDate: timestamp("issue_date").notNull(),
  expiryDate: timestamp("expiry_date"),
  certificatePath: text("certificate_path"),
});

export const insertCertificateSchema = createInsertSchema(certificates).pick({
  certificateId: true,
  participantId: true,
  trainingProgramId: true,
  issueDate: true,
  expiryDate: true,
  certificatePath: true,
});

// Contact schema
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").notNull(),
  status: text("status").default("pending").notNull(),
});

export const insertContactSchema = createInsertSchema(contacts).pick({
  fullName: true,
  email: true,
  phone: true,
  subject: true,
  message: true,
  createdAt: true,
  status: true,
});

// Define types from schemas
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof services.$inferSelect;

export type InsertTrainingProgram = z.infer<typeof insertTrainingProgramSchema>;
export type TrainingProgram = typeof trainingPrograms.$inferSelect;

export type InsertParticipant = z.infer<typeof insertParticipantSchema>;
export type Participant = typeof participants.$inferSelect;

export type InsertCertificate = z.infer<typeof insertCertificateSchema>;
export type Certificate = typeof certificates.$inferSelect;

export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;

// Certificate verification schema
export const certificateVerificationSchema = z.object({
  certificateId: z.string().min(1, "Certificate ID is required"),
  participantName: z.string().min(1, "Participant name is required"),
});

export type CertificateVerification = z.infer<typeof certificateVerificationSchema>;

// Status check schema
export const statusCheckSchema = z.object({
  participantId: z.string().min(1, "Participant ID is required"),
  email: z.string().email("Invalid email address"),
});

export type StatusCheck = z.infer<typeof statusCheckSchema>;

// Contact form schema
export const contactFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export type ContactForm = z.infer<typeof contactFormSchema>;
