import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AccessTokenPayload, RefreshTokenPayload, UserRole } from '../types';

export function generateAccessToken(payload: {
  id: string;
  email: string;
  role: UserRole;
}): string {
  const tokenPayload: AccessTokenPayload = {
    sub: payload.id,
    email: payload.email,
    role: payload.role,
  };

  return jwt.sign(tokenPayload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRY as jwt.SignOptions['expiresIn'],
  });
}

export function generateRefreshToken(userId: string): string {
  const payload: RefreshTokenPayload = {
    sub: userId,
    tokenVersion: Date.now(),
  };

  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRY as jwt.SignOptions['expiresIn'],
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
}

export function decodeToken<T>(token: string): T | null {
  try {
    return jwt.decode(token) as T;
  } catch {
    return null;
  }
}
