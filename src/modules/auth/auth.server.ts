import { tenantFn } from '@/core/runtime/serverFns';
import { setResponseHeader } from '@tanstack/react-start/server';
import {stringifySetCookie} from 'cookie';
import { LoginSchema } from './auth.schema';
import { authService } from './auth.service';
import { sessionManager } from '@/core/runtime/session';

// 🔑 1. LOGIN SERVER FUNCTION
export const loginUser = tenantFn
  .inputValidator(LoginSchema)
  .handler(async ({ context, data }) => {
    // A. Verify credentials against this specific tenant's users
    const user = await authService.login(context.db, {
      email: data.email,
      password: data.password,
    });

    // B. Generate encrypted JWT bound to this tenant ID
    const token = await sessionManager.createToken({
      userId: user.id,
      tenantId: context.tenant.id,
      email: user.email,
      role: user.role,
    });

    // C. Format secure HTTP-Only cookie
    const serializedCookie = stringifySetCookie({name: 'factaurant_session',
      value: token,
      httpOnly: true, // Prevents JavaScript/XSS attacks from reading the token
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    });

    // D. Attach cookie to the HTTP response
    setResponseHeader('Set-Cookie', serializedCookie);

    return { success: true, user };
  });

// 🚪 2. LOGOUT SERVER FUNCTION
export const logoutUser = tenantFn.handler(async () => {
  // Overwrite cookie with expired date
  const expiredCookie = stringifySetCookie({
    name: 'factaurant_session',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0, // Immediately expires in browser
  });

  setResponseHeader('Set-Cookie', expiredCookie);

  return { success: true };
});