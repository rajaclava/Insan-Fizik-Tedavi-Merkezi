import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import type { Express } from "express";
import session from "express-session";
import createMemoryStore from "memorystore";
import { db } from "./db";
import { users, type User } from "@shared/schema";
import { eq } from "drizzle-orm";

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
    interface User extends Omit<User, "password"> {}
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

        // Simple password comparison (in production, use bcrypt)
        if (user.password !== password) {
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

export function requireAuth(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Giriş yapmanız gerekiyor" });
}
