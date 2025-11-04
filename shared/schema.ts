import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ==================== EXISTING TABLES ====================

// Admin users table - UPDATED with more roles
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  role: text("role").notNull().default("admin"), // ADMIN, STAFF, PHYSIO, PATIENT
  isVerified: boolean("is_verified").notNull().default(false),
  otpSecret: text("otp_secret"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Appointments table - UPDATED with therapist
export const appointments = pgTable("appointments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id"),
  therapistId: varchar("therapist_id"),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  service: text("service").notNull(),
  date: text("date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time"),
  status: text("status").notNull().default("pending"), // PENDING, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW
  channel: text("channel").default("Clinic"), // Clinic, Online
  message: text("message"),
  createdByReceptionistId: varchar("created_by_receptionist_id"), // Track which receptionist created this appointment
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;

// Contact messages table
export const contactMessages = pgTable("contact_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({
  id: true,
  createdAt: true,
});

export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;

// Blog posts table
export const blogPosts = pgTable("blog_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url"),
  readTime: text("read_time").notNull().default("5 dakika"),
  published: timestamp("published").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  createdAt: true,
});

export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;

// Testimonials table
export const testimonials = pgTable("testimonials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  review: text("review").notNull(),
  rating: integer("rating").notNull().default(5),
  approved: boolean("approved").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTestimonialSchema = createInsertSchema(testimonials).omit({
  id: true,
  createdAt: true,
});

export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;
export type Testimonial = typeof testimonials.$inferSelect;

// ==================== NEW TABLES ====================

// Patients table
export const patients = pgTable("patients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"), // Optional - if patient has account
  fullName: text("full_name").notNull(),
  tcNumber: text("tc_number").unique(), // TC Kimlik Numarası
  birthDate: text("birth_date"),
  gender: text("gender"), // Male, Female, Other
  phone: text("phone").notNull().unique(), // Unique for OTP login
  email: text("email"),
  address: text("address"),
  notes: text("notes"), // Private admin notes
  isVerified: boolean("is_verified").notNull().default(false), // Phone verification
  createdByReceptionistId: varchar("created_by_receptionist_id"), // Track which receptionist registered this patient
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPatientSchema = createInsertSchema(patients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type Patient = typeof patients.$inferSelect;

// Therapists table
export const therapists = pgTable("therapists", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(), // Must have user account
  title: text("title").notNull(), // Dr., Fzt., etc.
  expertise: json("expertise").$type<string[]>().default([]), // Array of specialties
  bio: text("bio"),
  workHours: json("work_hours").$type<Record<string, any>>(), // JSON: {monday: {start: "09:00", end: "17:00"}, ...}
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTherapistSchema = createInsertSchema(therapists).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertTherapist = z.infer<typeof insertTherapistSchema>;
export type Therapist = typeof therapists.$inferSelect;

// Treatment Plans table
export const treatmentPlans = pgTable("treatment_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull(),
  therapistId: varchar("therapist_id").notNull(),
  name: text("name").notNull(),
  totalSessions: integer("total_sessions").notNull(),
  completedSessions: integer("completed_sessions").notNull().default(0),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTreatmentPlanSchema = createInsertSchema(treatmentPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertTreatmentPlan = z.infer<typeof insertTreatmentPlanSchema>;
export type TreatmentPlan = typeof treatmentPlans.$inferSelect;

// Session Notes table
export const sessionNotes = pgTable("session_notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  appointmentId: varchar("appointment_id").notNull(),
  therapistId: varchar("therapist_id").notNull(),
  painScale: integer("pain_scale"), // 0-10
  rom: json("rom").$type<Record<string, any>>(), // Range of Motion JSON
  noteText: text("note_text").notNull(),
  attachments: json("attachments").$type<string[]>().default([]), // Array of file URLs
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSessionNoteSchema = createInsertSchema(sessionNotes).omit({
  id: true,
  createdAt: true,
});

export type InsertSessionNote = z.infer<typeof insertSessionNoteSchema>;
export type SessionNote = typeof sessionNotes.$inferSelect;

// Packages table
export const packages = pgTable("packages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  sessionCount: integer("session_count").notNull(),
  price: integer("price").notNull(), // Store as cents/kuruş
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPackageSchema = createInsertSchema(packages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPackage = z.infer<typeof insertPackageSchema>;
export type Package = typeof packages.$inferSelect;

// Purchases table
export const purchases = pgTable("purchases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull(),
  packageId: varchar("package_id").notNull(),
  status: text("status").notNull().default("PENDING"), // PENDING, PAID, REFUND
  paymentRef: text("payment_ref"), // External payment reference
  invoiceNumber: text("invoice_number"), // INV-YYYY-XXXX
  amount: integer("amount").notNull(), // Store as cents/kuruş
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPurchaseSchema = createInsertSchema(purchases).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;
export type Purchase = typeof purchases.$inferSelect;

// Exercises table
export const exercises = pgTable("exercises", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  videoUrl: text("video_url"),
  stepsMarkdown: text("steps_markdown").notNull(),
  tags: json("tags").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertExerciseSchema = createInsertSchema(exercises).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertExercise = z.infer<typeof insertExerciseSchema>;
export type Exercise = typeof exercises.$inferSelect;

// Assigned Exercises table
export const assignedExercises = pgTable("assigned_exercises", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull(),
  exerciseId: varchar("exercise_id").notNull(),
  frequencyPerWeek: integer("frequency_per_week").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  progress: json("progress").$type<Record<string, any>>().default({}), // {date: completed}
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAssignedExerciseSchema = createInsertSchema(assignedExercises).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAssignedExercise = z.infer<typeof insertAssignedExerciseSchema>;
export type AssignedExercise = typeof assignedExercises.$inferSelect;

// Messages table
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fromUserId: varchar("from_user_id").notNull(),
  toUserId: varchar("to_user_id").notNull(),
  body: text("body").notNull(),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Site Settings table
export const siteSettings = pgTable("site_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: json("value").$type<Record<string, any>>().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSiteSettingSchema = createInsertSchema(siteSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSiteSetting = z.infer<typeof insertSiteSettingSchema>;
export type SiteSetting = typeof siteSettings.$inferSelect;

// Audit Logs table
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  action: text("action").notNull(), // CREATE, UPDATE, DELETE, LOGIN, etc.
  entity: text("entity").notNull(), // Patient, Appointment, etc.
  entityId: varchar("entity_id"),
  meta: json("meta").$type<Record<string, any>>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;

// Media table
export const media = pgTable("media", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  url: text("url").notNull(),
  alt: text("alt"),
  mime: text("mime").notNull(),
  size: integer("size").notNull(), // bytes
  uploadedById: varchar("uploaded_by_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMediaSchema = createInsertSchema(media).omit({
  id: true,
  createdAt: true,
});

export type InsertMedia = z.infer<typeof insertMediaSchema>;
export type Media = typeof media.$inferSelect;

// OTP Codes table
export const otpCodes = pgTable("otp_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  phone: text("phone").notNull(),
  code: text("code").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  attempts: integer("attempts").notNull().default(0),
  verified: boolean("verified").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertOtpCodeSchema = createInsertSchema(otpCodes).omit({
  id: true,
  createdAt: true,
});

export type InsertOtpCode = z.infer<typeof insertOtpCodeSchema>;
export type OtpCode = typeof otpCodes.$inferSelect;

// Receptionists table - Profile for receptionist users
export const receptionists = pgTable("receptionists", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(), // Must have user account
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  shiftHours: json("shift_hours").$type<Record<string, any>>(), // JSON: {monday: {start: "09:00", end: "17:00"}, ...}
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertReceptionistSchema = createInsertSchema(receptionists).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertReceptionist = z.infer<typeof insertReceptionistSchema>;
export type Receptionist = typeof receptionists.$inferSelect;

// Patient Registrations table - Audit log for every patient intake/registration event
export const patientRegistrations = pgTable("patient_registrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull(), // Reference to patients table
  receptionistId: varchar("receptionist_id").notNull(), // Which receptionist registered
  registrationType: text("registration_type").notNull().default("new"), // new, follow_up, appointment
  source: text("source").default("walk-in"), // walk-in, phone, online
  notes: text("notes"), // Notes about this specific registration event
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPatientRegistrationSchema = createInsertSchema(patientRegistrations).omit({
  id: true,
  createdAt: true,
});

export type InsertPatientRegistration = z.infer<typeof insertPatientRegistrationSchema>;
export type PatientRegistration = typeof patientRegistrations.$inferSelect;

// Cash Transactions table - Track payments received at reception
export const cashTransactions = pgTable("cash_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id"), // Optional - link to patient if known
  receptionistId: varchar("receptionist_id").notNull(), // Which receptionist received payment
  amount: integer("amount").notNull(), // Amount in Turkish Lira (TRY) - stored as integer (kuruş)
  paymentMethod: text("payment_method").notNull().default("cash"), // cash, card, transfer
  description: text("description"), // What the payment was for
  receiptNumber: text("receipt_number"), // Receipt/invoice number
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCashTransactionSchema = createInsertSchema(cashTransactions).omit({
  id: true,
  createdAt: true,
});

export type InsertCashTransaction = z.infer<typeof insertCashTransactionSchema>;
export type CashTransaction = typeof cashTransactions.$inferSelect;

// ==================== STATIC TYPES ====================

// Services type (static data)
export type Service = {
  id: string;
  title: string;
  description: string;
  image: string;
  icon: string;
};

// Team members type (static data)
export type TeamMember = {
  id: string;
  name: string;
  title: string;
  bio: string;
  image?: string;
};
