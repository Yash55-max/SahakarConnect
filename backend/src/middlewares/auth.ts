import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { verifyAccessToken, TokenPayload } from '../lib/jwt';
import prisma from '../lib/prisma';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload & {
    providerProfileId?: string;
    cooperativeId?: string;
  };
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authentication required. No Bearer token provided.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    // If role is PROVIDER or COOP_ADMIN, enrich with related profile IDs
    let providerProfileId: string | undefined;
    let cooperativeId: string | undefined;

    if (decoded.role === Role.PROVIDER) {
      const profile = await prisma.providerProfile.findUnique({
        where: { userId: decoded.userId },
        select: { id: true, cooperativeId: true },
      });
      if (profile) {
        providerProfileId = profile.id;
        cooperativeId = profile.cooperativeId;
      }
    }

    req.user = {
      ...decoded,
      providerProfileId,
      cooperativeId,
    };

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired authentication token.' });
  }
};

export const requireRole = (allowedRoles: Role[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: `Access denied. Allowed roles: ${allowedRoles.join(', ')}. Your role: ${req.user.role}`,
      });
      return;
    }

    next();
  };
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyAccessToken(token);
      req.user = decoded;
    }
  } catch (e) {
    // Ignore invalid tokens for optional auth
  }
  next();
};
