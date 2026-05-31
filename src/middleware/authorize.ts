import { Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { AuthRequest, UserRole } from '../types';

export function authorize(...roles: UserRole[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw AppError.unauthorized();
    }

    if (!roles.includes(req.user.role)) {
      throw AppError.forbidden('Insufficient permissions');
    }

    next();
  };
}
