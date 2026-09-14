import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';

export interface AuthenticatedUser {
  userId: string;
  role: UserRole;
  cooperativeId?: string | null;
  email: string;
  name: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export const JWT_SECRET = process.env.JWT_SECRET || 'sahakar_secret_jwt_key_super_secure_2026';

/**
 * Signs a JWT for an authenticated user with role and cooperative tenancy
 */
export function signToken(payload: AuthenticatedUser): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Validates bearer token and attaches req.user context
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Bearer token missing or malformed',
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
    req.user = decoded;
    return next();
  } catch (err: any) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired token',
    });
  }
}

/**
 * Enforces role-based access control (RBAC). Rejects unauthorized roles with 403 Forbidden.
 */
export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Role ${req.user.role} does not have permission to access this resource`,
      });
    }

    return next();
  };
}

/**
 * Enforces cooperative tenancy isolation:
 * - Regulators have multi-district visibility (bypass).
 * - Cooperative Admins and Providers can only access records matching their cooperativeId.
 */
export function requireCoopTenant(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required',
    });
  }

  // Regulators have central/multi-district audit oversight
  if (req.user.role === UserRole.REGULATOR) {
    return next();
  }

  const userCoopId = req.user.cooperativeId;
  if (!userCoopId) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'User is not associated with an operational cooperative society',
    });
  }

  // Check against target cooperative ID in params, query, or body if present
  const targetCoopId =
    req.params.cooperativeId ||
    req.params.coopId ||
    (req.query.cooperativeId as string) ||
    req.body?.cooperativeId;

  if (targetCoopId && targetCoopId !== userCoopId) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Cross-tenant access violation: Access to specified cooperative is restricted',
    });
  }

  return next();
}
