import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/auth-options';
import { APIError } from './api-error';
import { type UserRole } from '@prisma/client';
import { createRateLimitMiddleware, RateLimitConfig } from './rate-limit';

export async function validateSession(allowedRoles?: UserRole[]) {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new APIError('Unauthorized', 401, 'UNAUTHORIZED');
  }

  if (allowedRoles && !allowedRoles.includes(session.user.role)) {
    throw new APIError('Insufficient permissions', 403, 'FORBIDDEN');
  }

  return session;
}

export interface ProtectedRouteConfig {
  rateLimit?: RateLimitConfig;
}

export function createProtectedRoute(
  handler: Function,
  allowedRoles?: UserRole[],
  config?: ProtectedRouteConfig
) {
  const rateLimitMiddleware = createRateLimitMiddleware(config?.rateLimit);

  return async (request: Request, context: { params: any }) => {
    try {
      // Apply rate limiting
      await rateLimitMiddleware(request, context);

      // Validate session and permissions
      const session = await validateSession(allowedRoles);

      // Execute the handler
      return await handler(request, context, session);
    } catch (error) {
      if (error instanceof APIError) {
        return Response.json(
          { error: error.message, code: error.code },
          { status: error.statusCode }
        );
      }
      console.error('Protected route error:', error);
      return Response.json(
        { error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' },
        { status: 500 }
      );
    }
  };
} 