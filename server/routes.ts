import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAppointmentSchema, insertContactMessageSchema, insertBlogPostSchema, insertTestimonialSchema, insertPatientSchema, insertTherapistSchema, users } from "@shared/schema";
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

  const httpServer = createServer(app);

  return httpServer;
}
