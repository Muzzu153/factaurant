import { SignJWT, jwtVerify } from 'jose';

// Secret key used to sign session cookies
// In production, keep this in .env (e.g. SESSION_SECRET)
const SECRET_KEY = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'super-secret-factaurant-session-key-at-least-32-chars!'
);

export type SessionPayload = {
  userId: string;
  tenantId: string;
  email: string;
  role: 'owner' | 'manager' | 'staff';
};

export const sessionManager = {
  // 1. SIGN A NEW SESSION TOKEN (Valid for 7 days)
  createToken: async (payload: SessionPayload): Promise<string> => {
    return await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(SECRET_KEY);
  },

  // 2. VERIFY AND DECODE TOKEN
  verifyToken: async (token: string): Promise<SessionPayload | null> => {
    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      return payload as SessionPayload;
    } catch {
      // Token expired, tampered with, or invalid
      return null;
    }
  },
};