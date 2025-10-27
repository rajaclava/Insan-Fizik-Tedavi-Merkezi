import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import type { Express } from "express";
import session from "express-session";
import createMemoryStore from "memorystore";
import { db } from "./db";
import { users } from "@shared/schema";
import type { User as DbUser } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

const MemoryStore = createMemoryStore(session);

const sessionSettings: session.SessionOptions = {
  secret: process.env.SESSION_SECRET || "insan-fizik-tedavi-secret-key-2024",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
  store: new MemoryStore({
    checkPeriod: 86400000, // 24 hours
  }),
};

declare global {
  namespace Express {
    interface User extends Omit<DbUser, "password"> {}
  }
}

export function setupAuth(app: Express) {
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.username, username))
          .limit(1);

        if (!user) {
          return done(null, false, { message: "Kullanıcı adı veya şifre hatalı" });
        }

        // Compare password with bcrypt
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return done(null, false, { message: "Kullanıcı adı veya şifre hatalı" });
        }

        const { password: _, ...userWithoutPassword } = user;
        return done(null, userWithoutPassword);
      } catch (error) {
        return done(error);
      }
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

      if (!user) {
        return done(null, false);
      }

      const { password: _, ...userWithoutPassword } = user;
      done(null, userWithoutPassword);
    } catch (error) {
      done(error);
    }
  });
}

// Basic auth middleware
export function requireAuth(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Giriş yapmanız gerekiyor" });
}

// Role-based auth middleware
export function requireAdmin(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Giriş yapmanız gerekiyor" });
  }
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Bu işlem için admin yetkisi gerekiyor" });
  }
  next();
}

export function requireTherapist(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Giriş yapmanız gerekiyor" });
  }
  if (req.user.role !== "admin" && req.user.role !== "therapist") {
    return res.status(403).json({ message: "Bu işlem için terapist yetkisi gerekiyor" });
  }
  next();
}

export function requirePatient(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Giriş yapmanız gerekiyor" });
  }
  if (req.user.role !== "patient") {
    return res.status(403).json({ message: "Bu işlem sadece hastalar için" });
  }
  next();
}
