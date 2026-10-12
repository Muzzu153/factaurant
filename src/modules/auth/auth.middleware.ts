import { createMiddleware } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
import {parseCookie } from 'cookie';
import { sessionManager, type SessionPayload } from '../../core/runtime/session';
import { tenantMiddleware } from '../tenant/tenant.middleware';

export const authMiddleware = createMiddleware()
.middleware([tenantMiddleware])
.server(async ({ next, context }) => {
  // ⚡ 1. Defensive Guard: Verify tenant context exists
  const currentTenantId = context?.tenant?.id;

  if (!currentTenantId) {
    throw new Error('UNAUTHORIZED: Tenant context not found.');
  }

  // 1. Extract cookie from incoming HTTP request
  const headers = getRequestHeaders();
  const rawCookieHeader = headers.get('cookie') || '';
  const cookies = parseCookie(rawCookieHeader);
  const sessionToken = cookies['factaurant_session'];

  if (!sessionToken) {
    throw new Error('UNAUTHORIZED: No active session. Please log in.');
  }

  // 2. Cryptographically verify token
  const session = await sessionManager.verifyToken(sessionToken);

  if (!session) {
    throw new Error('UNAUTHORIZED: Session expired or invalid. Please log in.');
  }

  // 🔒 3. Cross-Tenant Session Guard:
  if (session.tenantId !== currentTenantId) {
    console.warn(`🚨 Cross-tenant session attempt! Token tenant [${session.tenantId}] tried to access [${currentTenantId}]`);
    throw new Error('FORBIDDEN: Session does not belong to this restaurant.');
  }

  // 4. Inject validated user into context
  return next({
    context: {
      user: {
        id: session.userId,
        email: session.email,
        role: session.role,
      },
    },
  });
});