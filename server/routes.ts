import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAppointmentSchema, insertContactMessageSchema, insertBlogPostSchema, insertTestimonialSchema, insertPatientSchema, insertTherapistSchema, insertPackageSchema, insertPurchaseSchema, insertTreatmentPlanSchema, insertSessionNoteSchema, users } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { z } from "zod";
import passport from "passport";
import { requireAuth } from "./auth";
import { db } from "./db";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ message: "Sunucu hatası" });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Giriş başarısız" });
      }
      req.logIn(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Oturum açılamadı" });
        }
        return res.json({ user });
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ message: "Çıkış yapıldı" });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (req.isAuthenticated()) {
      res.json({ user: req.user });
    } else {
      res.status(401).json({ message: "Giriş yapılmamış" });
    }
  });

  // Create initial admin user if none exists
  app.post("/api/auth/setup", async (req, res) => {
    try {
      const existingUsers = await db.select().from(users).limit(1);
      if (existingUsers.length > 0) {
        return res.status(400).json({ message: "Admin kullanıcı zaten mevcut" });
      }

      const { username, password, email } = req.body;
      if (!username || !password || !email) {
        return res.status(400).json({ message: "Tüm alanları doldurun" });
      }

      const [newUser] = await db.insert(users).values({
        username,
        password, // In production, hash this!
        email,
        role: "admin",
      }).returning();

      const { password: _, ...userWithoutPassword } = newUser;
      res.json({ user: userWithoutPassword, message: "Admin kullanıcı oluşturuldu" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/appointments", async (req, res) => {
    try {
      const validatedData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(validatedData);
      res.json(appointment);
    } catch (error: any) {
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        res.status(400).json({ error: validationError.message });
      } else {
        res.status(500).json({ error: "Failed to create appointment" });
      }
    }
  });

  app.get("/api/appointments", requireAuth, async (req, res) => {
    try {
      const appointments = await storage.getAllAppointments();
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch appointments" });
    }
  });

  app.get("/api/appointments/:id", requireAuth, async (req, res) => {
    try {
      const appointment = await storage.getAppointment(req.params.id);
      if (!appointment) {
        return res.status(404).json({ error: "Appointment not found" });
      }
      res.json(appointment);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch appointment" });
    }
  });

  app.patch("/api/appointments/:id/status", requireAuth, async (req, res) => {
    try {
      const { status } = req.body;
      if (!status || !["pending", "approved", "cancelled", "completed"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      const appointment = await storage.updateAppointmentStatus(req.params.id, status);
      if (!appointment) {
        return res.status(404).json({ error: "Appointment not found" });
      }
      res.json(appointment);
    } catch (error) {
      res.status(500).json({ error: "Failed to update appointment" });
    }
  });

  app.delete("/api/appointments/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteAppointment(req.params.id);
      res.json({ message: "Appointment deleted" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete appointment" });
    }
  });

  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactMessageSchema.parse(req.body);
      const message = await storage.createContactMessage(validatedData);
      res.json(message);
    } catch (error: any) {
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        res.status(400).json({ error: validationError.message });
      } else {
        res.status(500).json({ error: "Failed to send message" });
      }
    }
  });

  app.get("/api/contact", requireAuth, async (req, res) => {
    try {
      const messages = await storage.getAllContactMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.delete("/api/contact/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteContactMessage(req.params.id);
      res.json({ message: "Message deleted" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete message" });
    }
  });

  // Blog routes
  app.get("/api/blog", async (req, res) => {
    try {
      const posts = await storage.getAllBlogPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch blog posts" });
    }
  });

  app.get("/api/blog/:id", async (req, res) => {
    try {
      const post = await storage.getBlogPost(req.params.id);
      if (!post) {
        return res.status(404).json({ error: "Blog post not found" });
      }
      res.json(post);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch blog post" });
    }
  });

  app.post("/api/blog", requireAuth, async (req, res) => {
    try {
      const validatedData = insertBlogPostSchema.parse(req.body);
      const post = await storage.createBlogPost(validatedData);
      res.json(post);
    } catch (error: any) {
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      } else {
        res.status(500).json({ error: "Failed to create blog post" });
      }
    }
  });

  app.patch("/api/blog/:id", requireAuth, async (req, res) => {
    try {
      const validatedData = insertBlogPostSchema.partial().parse(req.body);
      const post = await storage.updateBlogPost(req.params.id, validatedData);
      if (!post) {
        return res.status(404).json({ error: "Blog post not found" });
      }
      res.json(post);
    } catch (error: any) {
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      } else {
        res.status(500).json({ error: "Failed to update blog post" });
      }
    }
  });

  app.delete("/api/blog/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteBlogPost(req.params.id);
      res.json({ message: "Blog post deleted" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete blog post" });
    }
  });

  // Testimonials routes
  app.get("/api/testimonials", requireAuth, async (req, res) => {
    try {
      const testimonials = await storage.getAllTestimonials();
      res.json(testimonials);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch testimonials" });
    }
  });

  app.get("/api/testimonials/approved", async (req, res) => {
    try {
      const testimonials = await storage.getApprovedTestimonials();
      res.json(testimonials);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch approved testimonials" });
    }
  });

  app.post("/api/testimonials", requireAuth, async (req, res) => {
    try {
      const validatedData = insertTestimonialSchema.parse(req.body);
      const testimonial = await storage.createTestimonial(validatedData);
      res.status(201).json(testimonial);
    } catch (error: any) {
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      } else {
        res.status(500).json({ error: "Failed to create testimonial" });
      }
    }
  });

  app.patch("/api/testimonials/:id", requireAuth, async (req, res) => {
    try {
      const validatedData = insertTestimonialSchema.partial().parse(req.body);
      const testimonial = await storage.updateTestimonial(req.params.id, validatedData);
      if (!testimonial) {
        return res.status(404).json({ error: "Testimonial not found" });
      }
      res.json(testimonial);
    } catch (error: any) {
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      } else {
        res.status(500).json({ error: "Failed to update testimonial" });
      }
    }
  });

  app.delete("/api/testimonials/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteTestimonial(req.params.id);
      res.json({ message: "Testimonial deleted" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete testimonial" });
    }
  });

  // Patient routes
  app.get("/api/patients", requireAuth, async (req, res) => {
    try {
      const patients = await storage.getAllPatients();
      res.json(patients);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch patients" });
    }
  });

  app.get("/api/patients/:id", requireAuth, async (req, res) => {
    try {
      const patient = await storage.getPatient(req.params.id);
      if (!patient) {
        return res.status(404).json({ error: "Patient not found" });
      }
      res.json(patient);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch patient" });
    }
  });

  app.post("/api/patients", requireAuth, async (req, res) => {
    try {
      const validatedData = insertPatientSchema.parse(req.body);
      const patient = await storage.createPatient(validatedData);
      res.status(201).json(patient);
    } catch (error: any) {
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      } else {
        res.status(500).json({ error: "Failed to create patient" });
      }
    }
  });

  app.patch("/api/patients/:id", requireAuth, async (req, res) => {
    try {
      const validatedData = insertPatientSchema.partial().parse(req.body);
      const patient = await storage.updatePatient(req.params.id, validatedData);
      if (!patient) {
        return res.status(404).json({ error: "Patient not found" });
      }
      res.json(patient);
    } catch (error: any) {
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      } else {
        res.status(500).json({ error: "Failed to update patient" });
      }
    }
  });

  app.delete("/api/patients/:id", requireAuth, async (req, res) => {
    try {
      await storage.deletePatient(req.params.id);
      res.json({ message: "Patient deleted" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete patient" });
    }
  });

  app.get("/api/patients/export/csv", requireAuth, async (req, res) => {
    try {
      const patients = await storage.getAllPatients();
      
      const escapeCsvField = (field: string | null | undefined): string => {
        if (!field) return '""';
        const value = String(field);
        const escaped = value.replace(/"/g, '""');
        return `"${escaped}"`;
      };
      
      const headers = ["ID", "Ad Soyad", "Telefon", "E-posta", "Doğum Tarihi", "Cinsiyet", "Adres", "Notlar", "Kayıt Tarihi"];
      const csvRows = [
        headers.map(h => escapeCsvField(h)).join(","),
        ...patients.map(p => [
          escapeCsvField(p.id),
          escapeCsvField(p.fullName),
          escapeCsvField(p.phone),
          escapeCsvField(p.email),
          escapeCsvField(p.birthDate),
          escapeCsvField(p.gender),
          escapeCsvField(p.address),
          escapeCsvField(p.notes),
          escapeCsvField(p.createdAt ? new Date(p.createdAt).toLocaleDateString("tr-TR") : "")
        ].join(","))
      ];
      
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", 'attachment; filename="hastalar.csv"');
      res.send("\uFEFF" + csvRows.join("\n"));
    } catch (error) {
      res.status(500).json({ error: "Failed to export patients" });
    }
  });

  // ==================== Therapist Routes ====================
  
  app.post("/api/therapists", requireAuth, async (req, res) => {
    try {
      const data = insertTherapistSchema.parse(req.body);
      const therapist = await storage.createTherapist(data);
      res.status(201).json(therapist);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: fromZodError(error).message });
      } else {
        res.status(500).json({ error: "Failed to create therapist" });
      }
    }
  });

  app.get("/api/therapists", requireAuth, async (req, res) => {
    try {
      const therapists = await storage.getAllTherapists();
      res.json(therapists);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch therapists" });
    }
  });

  app.get("/api/therapists/:id", requireAuth, async (req, res) => {
    try {
      const therapist = await storage.getTherapist(req.params.id);
      if (!therapist) {
        res.status(404).json({ error: "Therapist not found" });
        return;
      }
      res.json(therapist);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch therapist" });
    }
  });

  app.patch("/api/therapists/:id", requireAuth, async (req, res) => {
    try {
      const data = insertTherapistSchema.partial().parse(req.body);
      const therapist = await storage.updateTherapist(req.params.id, data);
      if (!therapist) {
        res.status(404).json({ error: "Therapist not found" });
        return;
      }
      res.json(therapist);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: fromZodError(error).message });
      } else {
        res.status(500).json({ error: "Failed to update therapist" });
      }
    }
  });

  app.delete("/api/therapists/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteTherapist(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete therapist" });
    }
  });

  // ==================== Package Routes ====================

  app.post("/api/packages", requireAuth, async (req, res) => {
    try {
      const data = insertPackageSchema.parse(req.body);
      const pkg = await storage.createPackage(data);
      res.status(201).json(pkg);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: fromZodError(error).message });
      } else {
        res.status(500).json({ error: "Failed to create package" });
      }
    }
  });

  app.get("/api/packages", async (req, res) => {
    try {
      const packages = await storage.getAllPackages();
      res.json(packages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch packages" });
    }
  });

  app.get("/api/packages/active", async (req, res) => {
    try {
      const packages = await storage.getActivePackages();
      res.json(packages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch active packages" });
    }
  });

  app.get("/api/packages/:id", async (req, res) => {
    try {
      const pkg = await storage.getPackage(req.params.id);
      if (!pkg) {
        res.status(404).json({ error: "Package not found" });
        return;
      }
      res.json(pkg);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch package" });
    }
  });

  app.patch("/api/packages/:id", requireAuth, async (req, res) => {
    try {
      const data = insertPackageSchema.partial().parse(req.body);
      const pkg = await storage.updatePackage(req.params.id, data);
      if (!pkg) {
        res.status(404).json({ error: "Package not found" });
        return;
      }
      res.json(pkg);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: fromZodError(error).message });
      } else {
        res.status(500).json({ error: "Failed to update package" });
      }
    }
  });

  app.delete("/api/packages/:id", requireAuth, async (req, res) => {
    try {
      await storage.deletePackage(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete package" });
    }
  });

  // ==================== Purchase Routes ====================

  app.post("/api/purchases", requireAuth, async (req, res) => {
    try {
      const data = insertPurchaseSchema.parse(req.body);
      
      // Generate invoice number
      const now = new Date();
      const year = now.getFullYear();
      const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const invoiceNumber = `INV-${year}-${randomPart}`;
      
      const purchase = await storage.createPurchase({
        ...data,
        invoiceNumber,
      });
      
      res.status(201).json(purchase);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: fromZodError(error).message });
      } else {
        res.status(500).json({ error: "Failed to create purchase" });
      }
    }
  });

  app.get("/api/purchases", requireAuth, async (req, res) => {
    try {
      const purchases = await storage.getAllPurchases();
      res.json(purchases);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch purchases" });
    }
  });

  app.get("/api/purchases/patient/:patientId", requireAuth, async (req, res) => {
    try {
      const purchases = await storage.getPurchasesByPatient(req.params.patientId);
      res.json(purchases);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch patient purchases" });
    }
  });

  app.get("/api/purchases/:id", requireAuth, async (req, res) => {
    try {
      const purchase = await storage.getPurchase(req.params.id);
      if (!purchase) {
        res.status(404).json({ error: "Purchase not found" });
        return;
      }
      res.json(purchase);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch purchase" });
    }
  });

  app.patch("/api/purchases/:id", requireAuth, async (req, res) => {
    try {
      const data = insertPurchaseSchema.partial().parse(req.body);
      const purchase = await storage.updatePurchase(req.params.id, data);
      if (!purchase) {
        res.status(404).json({ error: "Purchase not found" });
        return;
      }
      res.json(purchase);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: fromZodError(error).message });
      } else {
        res.status(500).json({ error: "Failed to update purchase" });
      }
    }
  });

  app.delete("/api/purchases/:id", requireAuth, async (req, res) => {
    try {
      await storage.deletePurchase(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete purchase" });
    }
  });

  // ========== Treatment Plans ==========
  app.post("/api/treatment-plans", requireAuth, async (req, res) => {
    try {
      const data = insertTreatmentPlanSchema.parse(req.body);
      const plan = await storage.createTreatmentPlan(data);
      res.json(plan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: fromZodError(error).message });
      } else {
        res.status(500).json({ error: "Failed to create treatment plan" });
      }
    }
  });

  app.get("/api/treatment-plans", async (req, res) => {
    try {
      const { patientId } = req.query;
      if (patientId && typeof patientId === "string") {
        const plans = await storage.getTreatmentPlansByPatient(patientId);
        res.json(plans);
      } else {
        const plans = await storage.getAllTreatmentPlans();
        res.json(plans);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch treatment plans" });
    }
  });

  app.get("/api/treatment-plans/:id", async (req, res) => {
    try {
      const plan = await storage.getTreatmentPlan(req.params.id);
      if (!plan) {
        res.status(404).json({ error: "Treatment plan not found" });
        return;
      }
      res.json(plan);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch treatment plan" });
    }
  });

  app.patch("/api/treatment-plans/:id", requireAuth, async (req, res) => {
    try {
      const data = insertTreatmentPlanSchema.partial().parse(req.body);
      const plan = await storage.updateTreatmentPlan(req.params.id, data);
      if (!plan) {
        res.status(404).json({ error: "Treatment plan not found" });
        return;
      }
      res.json(plan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: fromZodError(error).message });
      } else {
        res.status(500).json({ error: "Failed to update treatment plan" });
      }
    }
  });

  app.delete("/api/treatment-plans/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteTreatmentPlan(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete treatment plan" });
    }
  });

  // ========== Session Notes ==========
  app.post("/api/session-notes", requireAuth, async (req, res) => {
    try {
      const data = insertSessionNoteSchema.parse(req.body);
      const note = await storage.createSessionNote(data);
      res.json(note);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: fromZodError(error).message });
      } else {
        res.status(500).json({ error: "Failed to create session note" });
      }
    }
  });

  app.get("/api/session-notes", async (req, res) => {
    try {
      const { appointmentId } = req.query;
      if (appointmentId && typeof appointmentId === "string") {
        const notes = await storage.getSessionNotesByAppointment(appointmentId);
        res.json(notes);
      } else {
        const notes = await storage.getAllSessionNotes();
        res.json(notes);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch session notes" });
    }
  });

  app.get("/api/session-notes/:id", async (req, res) => {
    try {
      const note = await storage.getSessionNote(req.params.id);
      if (!note) {
        res.status(404).json({ error: "Session note not found" });
        return;
      }
      res.json(note);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch session note" });
    }
  });

  app.patch("/api/session-notes/:id", requireAuth, async (req, res) => {
    try {
      const data = insertSessionNoteSchema.partial().parse(req.body);
      const note = await storage.updateSessionNote(req.params.id, data);
      if (!note) {
        res.status(404).json({ error: "Session note not found" });
        return;
      }
      res.json(note);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: fromZodError(error).message });
      } else {
        res.status(500).json({ error: "Failed to update session note" });
      }
    }
  });

  app.delete("/api/session-notes/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteSessionNote(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete session note" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
