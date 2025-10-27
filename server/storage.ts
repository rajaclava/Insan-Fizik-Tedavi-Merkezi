import {
  type Appointment,
  type InsertAppointment,
  type ContactMessage,
  type InsertContactMessage,
  type BlogPost,
  type InsertBlogPost,
  type Testimonial,
  type InsertTestimonial,
  type Patient,
  type InsertPatient,
  type Therapist,
  type InsertTherapist,
  type Package,
  type InsertPackage,
  type Purchase,
  type InsertPurchase,
  type TreatmentPlan,
  type InsertTreatmentPlan,
  type SessionNote,
  type InsertSessionNote,
  appointments,
  contactMessages,
  blogPosts,
  testimonials,
  patients,
  therapists,
  packages,
  purchases,
  treatmentPlans,
  sessionNotes,
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { desc, eq } from "drizzle-orm";

export interface IStorage {
  // ========== Appointments ==========
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  getAllAppointments(): Promise<Appointment[]>;
  getAppointment(id: string): Promise<Appointment | undefined>;
  updateAppointmentStatus(id: string, status: string): Promise<Appointment | undefined>;
  deleteAppointment(id: string): Promise<void>;
  
  // ========== Contact Messages ==========
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  getAllContactMessages(): Promise<ContactMessage[]>;
  deleteContactMessage(id: string): Promise<void>;

  // ========== Blog Posts ==========
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  getAllBlogPosts(): Promise<BlogPost[]>;
  getBlogPost(id: string): Promise<BlogPost | undefined>;
  updateBlogPost(id: string, post: Partial<InsertBlogPost>): Promise<BlogPost | undefined>;
  deleteBlogPost(id: string): Promise<void>;

  // ========== Testimonials ==========
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
  getAllTestimonials(): Promise<Testimonial[]>;
  getApprovedTestimonials(): Promise<Testimonial[]>;
  getTestimonial(id: string): Promise<Testimonial | undefined>;
  updateTestimonial(id: string, testimonial: Partial<InsertTestimonial>): Promise<Testimonial | undefined>;
  deleteTestimonial(id: string): Promise<void>;

  // ========== Patients ==========
  createPatient(patient: InsertPatient): Promise<Patient>;
  getAllPatients(): Promise<Patient[]>;
  getPatient(id: string): Promise<Patient | undefined>;
  updatePatient(id: string, patient: Partial<InsertPatient>): Promise<Patient | undefined>;
  deletePatient(id: string): Promise<void>;

  // ========== Therapists ==========
  createTherapist(therapist: InsertTherapist): Promise<Therapist>;
  getAllTherapists(): Promise<Therapist[]>;
  getTherapist(id: string): Promise<Therapist | undefined>;
  updateTherapist(id: string, therapist: Partial<InsertTherapist>): Promise<Therapist | undefined>;
  deleteTherapist(id: string): Promise<void>;

  // ========== Packages ==========
  createPackage(pkg: InsertPackage): Promise<Package>;
  getAllPackages(): Promise<Package[]>;
  getActivePackages(): Promise<Package[]>;
  getPackage(id: string): Promise<Package | undefined>;
  updatePackage(id: string, pkg: Partial<InsertPackage>): Promise<Package | undefined>;
  deletePackage(id: string): Promise<void>;

  // ========== Purchases ==========
  createPurchase(purchase: InsertPurchase): Promise<Purchase>;
  getAllPurchases(): Promise<Purchase[]>;
  getPurchasesByPatient(patientId: string): Promise<Purchase[]>;
  getPurchase(id: string): Promise<Purchase | undefined>;
  updatePurchase(id: string, purchase: Partial<InsertPurchase>): Promise<Purchase | undefined>;
  deletePurchase(id: string): Promise<void>;

  // ========== Treatment Plans ==========
  createTreatmentPlan(plan: InsertTreatmentPlan): Promise<TreatmentPlan>;
  getAllTreatmentPlans(): Promise<TreatmentPlan[]>;
  getTreatmentPlansByPatient(patientId: string): Promise<TreatmentPlan[]>;
  getTreatmentPlan(id: string): Promise<TreatmentPlan | undefined>;
  updateTreatmentPlan(id: string, plan: Partial<InsertTreatmentPlan>): Promise<TreatmentPlan | undefined>;
  deleteTreatmentPlan(id: string): Promise<void>;

  // ========== Session Notes ==========
  createSessionNote(note: InsertSessionNote): Promise<SessionNote>;
  getAllSessionNotes(): Promise<SessionNote[]>;
  getSessionNotesByAppointment(appointmentId: string): Promise<SessionNote[]>;
  getSessionNote(id: string): Promise<SessionNote | undefined>;
  updateSessionNote(id: string, note: Partial<InsertSessionNote>): Promise<SessionNote | undefined>;
  deleteSessionNote(id: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private appointments: Map<string, Appointment>;
  private contactMessages: Map<string, ContactMessage>;
  private blogPosts: Map<string, BlogPost>;
  private testimonials: Map<string, Testimonial>;
  private patients: Map<string, Patient>;
  private therapists: Map<string, Therapist>;
  private packages: Map<string, Package>;
  private purchases: Map<string, Purchase>;
  private treatmentPlans: Map<string, TreatmentPlan>;
  private sessionNotes: Map<string, SessionNote>;

  constructor() {
    this.appointments = new Map();
    this.contactMessages = new Map();
    this.blogPosts = new Map();
    this.testimonials = new Map();
    this.patients = new Map();
    this.therapists = new Map();
    this.packages = new Map();
    this.purchases = new Map();
    this.treatmentPlans = new Map();
    this.sessionNotes = new Map();
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const id = randomUUID();
    const appointment: Appointment = {
      ...insertAppointment,
      email: insertAppointment.email ?? null,
      message: insertAppointment.message ?? null,
      status: insertAppointment.status ?? "pending",
      patientId: insertAppointment.patientId ?? null,
      therapistId: insertAppointment.therapistId ?? null,
      endTime: insertAppointment.endTime ?? null,
      channel: insertAppointment.channel ?? "Clinic",
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.appointments.set(id, appointment);
    return appointment;
  }

  async getAllAppointments(): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).sort(
      (a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  async getAppointment(id: string): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }

  async updateAppointmentStatus(id: string, status: string): Promise<Appointment | undefined> {
    const appointment = this.appointments.get(id);
    if (!appointment) return undefined;
    const updated = { ...appointment, status };
    this.appointments.set(id, updated);
    return updated;
  }

  async deleteAppointment(id: string): Promise<void> {
    this.appointments.delete(id);
  }

  async createContactMessage(insertMessage: InsertContactMessage): Promise<ContactMessage> {
    const id = randomUUID();
    const message: ContactMessage = {
      ...insertMessage,
      email: insertMessage.email ?? null,
      id,
      createdAt: new Date(),
    };
    this.contactMessages.set(id, message);
    return message;
  }

  async getAllContactMessages(): Promise<ContactMessage[]> {
    return Array.from(this.contactMessages.values()).sort(
      (a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  async deleteContactMessage(id: string): Promise<void> {
    this.contactMessages.delete(id);
  }

  async createBlogPost(insertPost: InsertBlogPost): Promise<BlogPost> {
    const id = randomUUID();
    const post: BlogPost = {
      ...insertPost,
      imageUrl: insertPost.imageUrl ?? null,
      published: insertPost.published ?? new Date(),
      readTime: insertPost.readTime ?? "5 dakika",
      id,
      createdAt: new Date(),
    };
    this.blogPosts.set(id, post);
    return post;
  }

  async getAllBlogPosts(): Promise<BlogPost[]> {
    return Array.from(this.blogPosts.values()).sort(
      (a, b) => (b.published?.getTime() || 0) - (a.published?.getTime() || 0)
    );
  }

  async getBlogPost(id: string): Promise<BlogPost | undefined> {
    return this.blogPosts.get(id);
  }

  async updateBlogPost(id: string, updates: Partial<InsertBlogPost>): Promise<BlogPost | undefined> {
    const post = this.blogPosts.get(id);
    if (!post) return undefined;
    const updated = { ...post, ...updates };
    this.blogPosts.set(id, updated);
    return updated;
  }

  async deleteBlogPost(id: string): Promise<void> {
    this.blogPosts.delete(id);
  }

  async createTestimonial(insertTestimonial: InsertTestimonial): Promise<Testimonial> {
    const id = randomUUID();
    const testimonial: Testimonial = {
      ...insertTestimonial,
      rating: insertTestimonial.rating ?? 5,
      approved: insertTestimonial.approved ?? false,
      id,
      createdAt: new Date(),
    };
    this.testimonials.set(id, testimonial);
    return testimonial;
  }

  async getAllTestimonials(): Promise<Testimonial[]> {
    return Array.from(this.testimonials.values()).sort(
      (a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  async getApprovedTestimonials(): Promise<Testimonial[]> {
    return Array.from(this.testimonials.values())
      .filter(t => t.approved)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getTestimonial(id: string): Promise<Testimonial | undefined> {
    return this.testimonials.get(id);
  }

  async updateTestimonial(id: string, updates: Partial<InsertTestimonial>): Promise<Testimonial | undefined> {
    const testimonial = this.testimonials.get(id);
    if (!testimonial) return undefined;
    const updated = { ...testimonial, ...updates };
    this.testimonials.set(id, updated);
    return updated;
  }

  async deleteTestimonial(id: string): Promise<void> {
    this.testimonials.delete(id);
  }

  // ========== Patients (Minimal Implementation) ==========
  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    const id = randomUUID();
    const patient: Patient = { ...insertPatient, id, createdAt: new Date(), updatedAt: new Date(), userId: insertPatient.userId ?? null, birthDate: insertPatient.birthDate ?? null, gender: insertPatient.gender ?? null, email: insertPatient.email ?? null, address: insertPatient.address ?? null, notes: insertPatient.notes ?? null };
    this.patients.set(id, patient);
    return patient;
  }
  async getAllPatients(): Promise<Patient[]> { return Array.from(this.patients.values()); }
  async getPatient(id: string): Promise<Patient | undefined> { return this.patients.get(id); }
  async updatePatient(id: string, updates: Partial<InsertPatient>): Promise<Patient | undefined> {
    const patient = this.patients.get(id);
    if (!patient) return undefined;
    const updated = { ...patient, ...updates };
    this.patients.set(id, updated);
    return updated;
  }
  async deletePatient(id: string): Promise<void> { this.patients.delete(id); }

  // ========== Therapists (Minimal Implementation) ==========
  async createTherapist(insertTherapist: InsertTherapist): Promise<Therapist> {
    const id = randomUUID();
    const therapist: Therapist = { ...insertTherapist, id, createdAt: new Date(), updatedAt: new Date(), bio: insertTherapist.bio ?? null, workHours: insertTherapist.workHours ?? null, expertise: insertTherapist.expertise ?? null };
    this.therapists.set(id, therapist);
    return therapist;
  }
  async getAllTherapists(): Promise<Therapist[]> { return Array.from(this.therapists.values()); }
  async getTherapist(id: string): Promise<Therapist | undefined> { return this.therapists.get(id); }
  async updateTherapist(id: string, updates: Partial<InsertTherapist>): Promise<Therapist | undefined> {
    const therapist = this.therapists.get(id);
    if (!therapist) return undefined;
    const updated = { ...therapist, ...updates };
    this.therapists.set(id, updated);
    return updated;
  }
  async deleteTherapist(id: string): Promise<void> { this.therapists.delete(id); }

  // ========== Packages (Minimal Implementation) ==========
  async createPackage(insertPackage: InsertPackage): Promise<Package> {
    const id = randomUUID();
    const pkg: Package = { ...insertPackage, id, createdAt: new Date(), updatedAt: new Date(), description: insertPackage.description ?? null, isActive: insertPackage.isActive ?? true };
    this.packages.set(id, pkg);
    return pkg;
  }
  async getAllPackages(): Promise<Package[]> { return Array.from(this.packages.values()); }
  async getActivePackages(): Promise<Package[]> { return Array.from(this.packages.values()).filter(p => p.isActive); }
  async getPackage(id: string): Promise<Package | undefined> { return this.packages.get(id); }
  async updatePackage(id: string, updates: Partial<InsertPackage>): Promise<Package | undefined> {
    const pkg = this.packages.get(id);
    if (!pkg) return undefined;
    const updated = { ...pkg, ...updates };
    this.packages.set(id, updated);
    return updated;
  }
  async deletePackage(id: string): Promise<void> { this.packages.delete(id); }

  // ========== Purchases (Minimal Implementation) ==========
  async createPurchase(insertPurchase: InsertPurchase): Promise<Purchase> {
    const id = randomUUID();
    const purchase: Purchase = { ...insertPurchase, id, createdAt: new Date(), updatedAt: new Date(), paymentRef: insertPurchase.paymentRef ?? null, invoiceNumber: insertPurchase.invoiceNumber ?? null, status: insertPurchase.status ?? "PENDING" };
    this.purchases.set(id, purchase);
    return purchase;
  }
  async getAllPurchases(): Promise<Purchase[]> { return Array.from(this.purchases.values()); }
  async getPurchasesByPatient(patientId: string): Promise<Purchase[]> { return Array.from(this.purchases.values()).filter(p => p.patientId === patientId); }
  async getPurchase(id: string): Promise<Purchase | undefined> { return this.purchases.get(id); }
  async updatePurchase(id: string, updates: Partial<InsertPurchase>): Promise<Purchase | undefined> {
    const purchase = this.purchases.get(id);
    if (!purchase) return undefined;
    const updated = { ...purchase, ...updates };
    this.purchases.set(id, updated);
    return updated;
  }
  async deletePurchase(id: string): Promise<void> { this.purchases.delete(id); }

  // ========== Treatment Plans ==========
  async createTreatmentPlan(insertPlan: InsertTreatmentPlan): Promise<TreatmentPlan> {
    const id = randomUUID();
    const plan: TreatmentPlan = { ...insertPlan, id, completedSessions: insertPlan.completedSessions ?? 0, description: insertPlan.description ?? null, createdAt: new Date(), updatedAt: new Date() };
    this.treatmentPlans.set(id, plan);
    return plan;
  }
  async getAllTreatmentPlans(): Promise<TreatmentPlan[]> { return Array.from(this.treatmentPlans.values()); }
  async getTreatmentPlansByPatient(patientId: string): Promise<TreatmentPlan[]> { return Array.from(this.treatmentPlans.values()).filter(p => p.patientId === patientId); }
  async getTreatmentPlan(id: string): Promise<TreatmentPlan | undefined> { return this.treatmentPlans.get(id); }
  async updateTreatmentPlan(id: string, updates: Partial<InsertTreatmentPlan>): Promise<TreatmentPlan | undefined> {
    const plan = this.treatmentPlans.get(id);
    if (!plan) return undefined;
    const updated = { ...plan, ...updates, updatedAt: new Date() };
    this.treatmentPlans.set(id, updated);
    return updated;
  }
  async deleteTreatmentPlan(id: string): Promise<void> { this.treatmentPlans.delete(id); }

  // ========== Session Notes ==========
  async createSessionNote(insertNote: InsertSessionNote): Promise<SessionNote> {
    const id = randomUUID();
    const note: SessionNote = { ...insertNote, id, painScale: insertNote.painScale ?? null, rom: insertNote.rom ?? null, attachments: insertNote.attachments ?? [], createdAt: new Date() };
    this.sessionNotes.set(id, note);
    return note;
  }
  async getAllSessionNotes(): Promise<SessionNote[]> { return Array.from(this.sessionNotes.values()); }
  async getSessionNotesByAppointment(appointmentId: string): Promise<SessionNote[]> { return Array.from(this.sessionNotes.values()).filter(n => n.appointmentId === appointmentId); }
  async getSessionNote(id: string): Promise<SessionNote | undefined> { return this.sessionNotes.get(id); }
  async updateSessionNote(id: string, updates: Partial<InsertSessionNote>): Promise<SessionNote | undefined> {
    const note = this.sessionNotes.get(id);
    if (!note) return undefined;
    const updated = { ...note, ...updates };
    this.sessionNotes.set(id, updated);
    return updated;
  }
  async deleteSessionNote(id: string): Promise<void> { this.sessionNotes.delete(id); }
}

export class DatabaseStorage implements IStorage {
  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const [appointment] = await db.insert(appointments).values(insertAppointment).returning();
    return appointment;
  }

  async getAllAppointments(): Promise<Appointment[]> {
    return await db.select().from(appointments).orderBy(desc(appointments.createdAt));
  }

  async getAppointment(id: string): Promise<Appointment | undefined> {
    const [appointment] = await db.select().from(appointments).where(eq(appointments.id, id));
    return appointment;
  }

  async updateAppointmentStatus(id: string, status: string): Promise<Appointment | undefined> {
    const [updated] = await db
      .update(appointments)
      .set({ status })
      .where(eq(appointments.id, id))
      .returning();
    return updated;
  }

  async deleteAppointment(id: string): Promise<void> {
    await db.delete(appointments).where(eq(appointments.id, id));
  }

  async createContactMessage(insertMessage: InsertContactMessage): Promise<ContactMessage> {
    const [message] = await db.insert(contactMessages).values(insertMessage).returning();
    return message;
  }

  async getAllContactMessages(): Promise<ContactMessage[]> {
    return await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
  }

  async deleteContactMessage(id: string): Promise<void> {
    await db.delete(contactMessages).where(eq(contactMessages.id, id));
  }

  async createBlogPost(insertPost: InsertBlogPost): Promise<BlogPost> {
    const [post] = await db.insert(blogPosts).values(insertPost).returning();
    return post;
  }

  async getAllBlogPosts(): Promise<BlogPost[]> {
    return await db.select().from(blogPosts).orderBy(desc(blogPosts.published));
  }

  async getBlogPost(id: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return post;
  }

  async updateBlogPost(id: string, updates: Partial<InsertBlogPost>): Promise<BlogPost | undefined> {
    const [updated] = await db
      .update(blogPosts)
      .set(updates)
      .where(eq(blogPosts.id, id))
      .returning();
    return updated;
  }

  async deleteBlogPost(id: string): Promise<void> {
    await db.delete(blogPosts).where(eq(blogPosts.id, id));
  }

  async createTestimonial(insertTestimonial: InsertTestimonial): Promise<Testimonial> {
    const [testimonial] = await db.insert(testimonials).values(insertTestimonial).returning();
    return testimonial;
  }

  async getAllTestimonials(): Promise<Testimonial[]> {
    return await db.select().from(testimonials).orderBy(desc(testimonials.createdAt));
  }

  async getApprovedTestimonials(): Promise<Testimonial[]> {
    return await db.select().from(testimonials).where(eq(testimonials.approved, true)).orderBy(desc(testimonials.createdAt));
  }

  async getTestimonial(id: string): Promise<Testimonial | undefined> {
    const [testimonial] = await db.select().from(testimonials).where(eq(testimonials.id, id));
    return testimonial;
  }

  async updateTestimonial(id: string, updates: Partial<InsertTestimonial>): Promise<Testimonial | undefined> {
    const [updated] = await db
      .update(testimonials)
      .set(updates)
      .where(eq(testimonials.id, id))
      .returning();
    return updated;
  }

  async deleteTestimonial(id: string): Promise<void> {
    await db.delete(testimonials).where(eq(testimonials.id, id));
  }

  // ========== Patients ==========
  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    const [patient] = await db.insert(patients).values(insertPatient).returning();
    return patient;
  }

  async getAllPatients(): Promise<Patient[]> {
    return await db.select().from(patients).orderBy(desc(patients.createdAt));
  }

  async getPatient(id: string): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.id, id));
    return patient;
  }

  async updatePatient(id: string, updates: Partial<InsertPatient>): Promise<Patient | undefined> {
    const [updated] = await db
      .update(patients)
      .set(updates)
      .where(eq(patients.id, id))
      .returning();
    return updated;
  }

  async deletePatient(id: string): Promise<void> {
    await db.delete(patients).where(eq(patients.id, id));
  }

  // ========== Therapists ==========
  async createTherapist(insertTherapist: InsertTherapist): Promise<Therapist> {
    const [therapist] = await db.insert(therapists).values(insertTherapist).returning();
    return therapist;
  }

  async getAllTherapists(): Promise<Therapist[]> {
    return await db.select().from(therapists).orderBy(desc(therapists.createdAt));
  }

  async getTherapist(id: string): Promise<Therapist | undefined> {
    const [therapist] = await db.select().from(therapists).where(eq(therapists.id, id));
    return therapist;
  }

  async updateTherapist(id: string, updates: Partial<InsertTherapist>): Promise<Therapist | undefined> {
    const [updated] = await db
      .update(therapists)
      .set(updates)
      .where(eq(therapists.id, id))
      .returning();
    return updated;
  }

  async deleteTherapist(id: string): Promise<void> {
    await db.delete(therapists).where(eq(therapists.id, id));
  }

  // ========== Packages ==========
  async createPackage(insertPackage: InsertPackage): Promise<Package> {
    const [pkg] = await db.insert(packages).values(insertPackage).returning();
    return pkg;
  }

  async getAllPackages(): Promise<Package[]> {
    return await db.select().from(packages).orderBy(desc(packages.createdAt));
  }

  async getActivePackages(): Promise<Package[]> {
    return await db.select().from(packages).where(eq(packages.isActive, true)).orderBy(desc(packages.createdAt));
  }

  async getPackage(id: string): Promise<Package | undefined> {
    const [pkg] = await db.select().from(packages).where(eq(packages.id, id));
    return pkg;
  }

  async updatePackage(id: string, updates: Partial<InsertPackage>): Promise<Package | undefined> {
    const [updated] = await db
      .update(packages)
      .set(updates)
      .where(eq(packages.id, id))
      .returning();
    return updated;
  }

  async deletePackage(id: string): Promise<void> {
    await db.delete(packages).where(eq(packages.id, id));
  }

  // ========== Purchases ==========
  async createPurchase(insertPurchase: InsertPurchase): Promise<Purchase> {
    const [purchase] = await db.insert(purchases).values(insertPurchase).returning();
    return purchase;
  }

  async getAllPurchases(): Promise<Purchase[]> {
    return await db.select().from(purchases).orderBy(desc(purchases.createdAt));
  }

  async getPurchasesByPatient(patientId: string): Promise<Purchase[]> {
    return await db.select().from(purchases).where(eq(purchases.patientId, patientId)).orderBy(desc(purchases.createdAt));
  }

  async getPurchase(id: string): Promise<Purchase | undefined> {
    const [purchase] = await db.select().from(purchases).where(eq(purchases.id, id));
    return purchase;
  }

  async updatePurchase(id: string, updates: Partial<InsertPurchase>): Promise<Purchase | undefined> {
    const [updated] = await db
      .update(purchases)
      .set(updates)
      .where(eq(purchases.id, id))
      .returning();
    return updated;
  }

  async deletePurchase(id: string): Promise<void> {
    await db.delete(purchases).where(eq(purchases.id, id));
  }

  // ========== Treatment Plans ==========
  async createTreatmentPlan(insertPlan: InsertTreatmentPlan): Promise<TreatmentPlan> {
    const [plan] = await db.insert(treatmentPlans).values(insertPlan).returning();
    return plan;
  }

  async getAllTreatmentPlans(): Promise<TreatmentPlan[]> {
    return await db.select().from(treatmentPlans).orderBy(desc(treatmentPlans.createdAt));
  }

  async getTreatmentPlansByPatient(patientId: string): Promise<TreatmentPlan[]> {
    return await db.select().from(treatmentPlans).where(eq(treatmentPlans.patientId, patientId)).orderBy(desc(treatmentPlans.createdAt));
  }

  async getTreatmentPlan(id: string): Promise<TreatmentPlan | undefined> {
    const [plan] = await db.select().from(treatmentPlans).where(eq(treatmentPlans.id, id));
    return plan;
  }

  async updateTreatmentPlan(id: string, updates: Partial<InsertTreatmentPlan>): Promise<TreatmentPlan | undefined> {
    const [updated] = await db
      .update(treatmentPlans)
      .set(updates)
      .where(eq(treatmentPlans.id, id))
      .returning();
    return updated;
  }

  async deleteTreatmentPlan(id: string): Promise<void> {
    await db.delete(treatmentPlans).where(eq(treatmentPlans.id, id));
  }

  // ========== Session Notes ==========
  async createSessionNote(insertNote: InsertSessionNote): Promise<SessionNote> {
    const [note] = await db.insert(sessionNotes).values(insertNote).returning();
    return note;
  }

  async getAllSessionNotes(): Promise<SessionNote[]> {
    return await db.select().from(sessionNotes).orderBy(desc(sessionNotes.createdAt));
  }

  async getSessionNotesByAppointment(appointmentId: string): Promise<SessionNote[]> {
    return await db.select().from(sessionNotes).where(eq(sessionNotes.appointmentId, appointmentId)).orderBy(desc(sessionNotes.createdAt));
  }

  async getSessionNote(id: string): Promise<SessionNote | undefined> {
    const [note] = await db.select().from(sessionNotes).where(eq(sessionNotes.id, id));
    return note;
  }

  async updateSessionNote(id: string, updates: Partial<InsertSessionNote>): Promise<SessionNote | undefined> {
    const [updated] = await db
      .update(sessionNotes)
      .set(updates)
      .where(eq(sessionNotes.id, id))
      .returning();
    return updated;
  }

  async deleteSessionNote(id: string): Promise<void> {
    await db.delete(sessionNotes).where(eq(sessionNotes.id, id));
  }
}

export const storage = new DatabaseStorage();
