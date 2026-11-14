import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';
import { AppError } from '../errors/AppError';
import { UserRole } from '@marketplace/types';

export interface AuthUser {
  userId: string;
  email: string;
  role: UserRole;
  storeId?: string;
  sellerId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function authGuard(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(AppError.unauthorized('Bearer token required'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, ENV.JWT_ACCESS_SECRET) as AuthUser;
    req.user = decoded;
    next();
  } catch (error) {
    return next(AppError.unauthorized('Invalid or expired access token'));
  }
}

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(AppError.unauthorized());
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(AppError.forbidden(`Role ${req.user.role} is not permitted to access this resource`));
    }

    next();
  };
}
