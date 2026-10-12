import bcrypt from 'bcryptjs';
import type { TenantScope } from '../../core/db/tenant-scope';
import type { LoginInput, RegisterUserInput } from './auth.schema';

const SALT_ROUNDS = 10;

export const authService = {
  // 🔒 HASHING UTILITY
  hashPassword: async (password: string): Promise<string> => {
    return await bcrypt.hash(password, SALT_ROUNDS);
  },

  // 🔒 VERIFICATION UTILITY
  verifyPassword: async (password: string, hash: string): Promise<boolean> => {
    return await bcrypt.compare(password, hash);
  },

  // 👤 1. REGISTER NEW USER FOR CURRENT TENANT
  register: async (db: TenantScope, input: RegisterUserInput) => {
    // A. Check if email already exists FOR THIS SPECIFIC TENANT
    const existingUser = await db.users.findByEmail(input.email);

    if (existingUser) {
      throw new Error(`A user with email "${input.email}" already exists for this restaurant.`);
    }

    // B. Hash the password
    const passwordHash = await authService.hashPassword(input.password);

    // C. Persist via safe TenantScope repository (tenantId automatically applied)
    const newUser = await db.users.create({
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role,
    });

    // D. Return sanitized user object (never return password hash!)
    const { passwordHash: _, ...safeUser } = newUser;
    return safeUser;
  },

  // 🔑 2. LOGIN USER FOR CURRENT TENANT
  login: async (db: TenantScope, input: LoginInput) => {
    // A. Query user within the tenant boundary
    const user = await db.users.findByEmail(input.email);

    if (!user) {
      // 🛡️ Security: Avoid revealing whether the email exists or password was wrong
      throw new Error('Invalid email or password.');
    }

    // B. Verify cryptographic password hash
    const isValid = await authService.verifyPassword(input.password, user.passwordHash);

    if (!isValid) {
      throw new Error('Invalid email or password.');
    }

    // C. Return authenticated safe profile
    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  },
};
