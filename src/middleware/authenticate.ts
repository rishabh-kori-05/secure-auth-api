import { Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/token';
import { AppError } from '../utils/AppError';
import { AuthRequest } from '../types';

export function authenticate(req: AuthRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    throw AppError.unauthorized('Authorization header missing or malformed');
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
    next();
  } catch (err: unknown) {
    const message =
      err instanceof Error && err.name === 'TokenExpiredError'
        ? 'Access token expired'
        : 'Invalid access token';
    throw AppError.unauthorized(message);
  }
}
