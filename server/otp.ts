import { db } from "./db";
import { otpCodes, patients, users, smsSettings } from "@shared/schema";
import { eq, and, gt, lt, sql, desc } from "drizzle-orm";

// Generate 6-digit OTP code
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP by email (find patient by email, send SMS to their phone)
export async function sendOTPByEmail(email: string): Promise<{ success: boolean; message: string; phone?: string }> {
  try {
    // Clean email
    const cleanEmail = email.trim().toLowerCase();

    // Check if patient exists with this email
    const [patient] = await db.select().from(patients).where(eq(patients.email, cleanEmail)).limit(1);
    
    if (!patient) {
      return { success: false, message: "Bu email adresiyle kayıtlı hasta bulunamadı" };
    }

    if (!patient.phone) {
      return { success: false, message: "Hasta kaydında telefon numarası bulunamadı" };
    }

    // Send OTP to patient's phone
    const result = await sendOTP(patient.phone);
    
    if (result.success) {
      // Mask phone number for privacy (e.g., 0532******44)
      const maskedPhone = patient.phone.replace(/(\d{4})\d+(\d{2})/, '$1******$2');
      return { 
        success: true, 
        message: `Doğrulama kodu ${maskedPhone} numarasına gönderildi`,
        phone: patient.phone // Return for verification
      };
    }

    return result;
  } catch (error) {
    console.error("Email ile OTP gönderme hatası:", error);
    return { success: false, message: "Kod gönderilemedi" };
  }
}

// Send OTP (development: console log, production: Twilio)
export async function sendOTP(phone: string): Promise<{ success: boolean; message: string }> {
  try {
    // Clean phone number (remove spaces, dashes, etc.)
    const cleanPhone = phone.replace(/\s+/g, "").replace(/-/g, "");

    // Check if patient exists with this phone
    const [patient] = await db.select().from(patients).where(eq(patients.phone, cleanPhone)).limit(1);
    
    if (!patient) {
      return { success: false, message: "Bu telefon numarasıyla kayıtlı hasta bulunamadı" };
    }

    // Invalidate all previous OTP codes for this phone
    await db.update(otpCodes)
      .set({ verified: true }) // Mark as used
      .where(and(
        eq(otpCodes.phone, cleanPhone),
        eq(otpCodes.verified, false)
      ));

    // Generate new OTP
    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Save to database
    await db.insert(otpCodes).values({
      phone: cleanPhone,
      code,
      expiresAt,
      attempts: 0,
      verified: false,
    });

    // Send SMS (development: console log, production: Twilio or other SMS provider)
    const smsMessage = `İnsan Fizik Tedavi doğrulama kodunuz: ${code}\nGeçerlilik süresi: 5 dakika`;
    
    // Get active SMS settings from database
    const [activeSetting] = await db.select().from(smsSettings).where(
      eq(smsSettings.isActive, true)
    ).limit(1);

    if (activeSetting && activeSetting.accountSid && activeSetting.authToken && activeSetting.fromNumber) {
      try {
        // Use Twilio for real SMS sending
        const twilio = require('twilio');
        const client = twilio(activeSetting.accountSid, activeSetting.authToken);
        
        await client.messages.create({
          body: smsMessage,
          from: activeSetting.fromNumber,
          to: cleanPhone.startsWith('+') ? cleanPhone : `+90${cleanPhone.replace(/^0/, '')}`, // Format for Turkey
        });
        
        console.log(`[SMS SENT] Twilio SMS sent to ${cleanPhone}: ${code}`);
      } catch (twilioError: any) {
        console.error("Twilio SMS hatası:", twilioError);
        // Fallback to console log in case of error
        console.log(`[FALLBACK] OTP: ${code} for ${cleanPhone}`);
        console.log(`Error: ${twilioError.message}`);
      }
    } else {
      // Development: Log to console (no SMS settings configured)
      console.log(`\n${"=".repeat(50)}`);
      console.log(`📱 OTP KODU: ${code}`);
      console.log(`📞 Telefon: ${cleanPhone}`);
      console.log(`📧 SMS Mesajı: ${smsMessage}`);
      console.log(`⏰ Geçerlilik: 5 dakika`);
      console.log(`💡 Not: SMS ayarları yapılandırılmadı (Admin panel > SMS Ayarları)`);
      console.log(`${"=".repeat(50)}\n`);
    }

    return { success: true, message: "Doğrulama kodu gönderildi" };
  } catch (error) {
    console.error("OTP gönderme hatası:", error);
    return { success: false, message: "Kod gönderilemedi" };
  }
}

// Verify OTP and create/login user
export async function verifyOTP(phone: string, code: string): Promise<{ success: boolean; message: string; userId?: string }> {
  try {
    const cleanPhone = phone.replace(/\s+/g, "").replace(/-/g, "");

    // Find the most recent OTP for this phone (verified or not)
    const [latestOtp] = await db.select()
      .from(otpCodes)
      .where(eq(otpCodes.phone, cleanPhone))
      .orderBy(desc(otpCodes.createdAt))
      .limit(1);

    // Check if attempts exceeded BEFORE checking the code
    if (latestOtp && latestOtp.attempts >= 3) {
      // Invalidate OTP after too many attempts
      await db.update(otpCodes)
        .set({ verified: true }) // Mark as used to prevent further attempts
        .where(eq(otpCodes.id, latestOtp.id));
      return { success: false, message: "Çok fazla hatalı deneme. Yeni kod isteyin" };
    }

    // Find active OTP code (not verified, not expired, within attempt limit)
    const [otpRecord] = await db.select()
      .from(otpCodes)
      .where(and(
        eq(otpCodes.phone, cleanPhone),
        eq(otpCodes.verified, false),
        gt(otpCodes.expiresAt, new Date())
      ))
      .limit(1);

    if (!otpRecord) {
      return { success: false, message: "Kod süresi dolmuş veya geçersiz. Yeni kod isteyin" };
    }

    // Check if code matches
    if (otpRecord.code !== code) {
      // Increment attempts
      await db.update(otpCodes)
        .set({ attempts: otpRecord.attempts + 1 })
        .where(eq(otpCodes.id, otpRecord.id));

      const remainingAttempts = 3 - (otpRecord.attempts + 1);
      if (remainingAttempts <= 0) {
        // Invalidate after max attempts
        await db.update(otpCodes)
          .set({ verified: true })
          .where(eq(otpCodes.id, otpRecord.id));
        return { success: false, message: "Çok fazla hatalı deneme. Yeni kod isteyin" };
      }

      return { success: false, message: `Geçersiz kod. ${remainingAttempts} deneme hakkınız kaldı` };
    }

    // Mark OTP as verified
    await db.update(otpCodes)
      .set({ verified: true })
      .where(eq(otpCodes.id, otpRecord.id));

    // Get patient
    const [patient] = await db.select()
      .from(patients)
      .where(eq(patients.phone, cleanPhone))
      .limit(1);

    if (!patient) {
      return { success: false, message: "Hasta kaydı bulunamadı" };
    }

    // Check if user account exists
    let userId = patient.userId;

    if (!userId) {
      // Create user account for patient
      const [newUser] = await db.insert(users).values({
        username: cleanPhone, // Use phone as username
        email: patient.email || `${cleanPhone}@patient.local`,
        password: "", // No password for OTP users
        phone: cleanPhone,
        role: "patient",
        isVerified: true,
      }).returning();

      // Link user to patient
      await db.update(patients)
        .set({ userId: newUser.id, isVerified: true })
        .where(eq(patients.id, patient.id));

      userId = newUser.id;
    }

    return { success: true, message: "Doğrulama başarılı", userId };
  } catch (error) {
    console.error("OTP doğrulama hatası:", error);
    return { success: false, message: "Doğrulama yapılamadı" };
  }
}

// Clean expired OTP codes (run periodically)
export async function cleanExpiredOTPs(): Promise<void> {
  try {
    await db.delete(otpCodes).where(lt(otpCodes.expiresAt, sql`NOW()`));
  } catch (error) {
    console.error("OTP temizleme hatası:", error);
  }
}
