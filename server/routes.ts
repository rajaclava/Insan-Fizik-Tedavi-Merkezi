import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAppointmentSchema, insertContactMessageSchema, users } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
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

  const httpServer = createServer(app);

  return httpServer;
}
