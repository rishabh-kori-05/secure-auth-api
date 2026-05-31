import { Request } from 'express';
import { Document, Types } from 'mongoose';

// ─── User Roles ───────────────────────────────────────────────────────────────
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

// ─── User Document ────────────────────────────────────────────────────────────
export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isVerified: boolean;
  isLocked: boolean;
  loginAttempts: number;
  lockUntil?: Date;
  refreshToken?: string;
  emailVerificationToken?: string;
  emailVerificationExpiry?: Date;
  passwordResetToken?: string;
  passwordResetExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  incLoginAttempts(): Promise<void>;
  resetLoginAttempts(): Promise<void>;
  isAccountLocked(): boolean;
}

// ─── JWT Payloads ─────────────────────────────────────────────────────────────
export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  sub: string;
  tokenVersion: number;
  iat?: number;
  exp?: number;
}

// ─── Authenticated Request ────────────────────────────────────────────────────
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

// ─── API Response Shapes ──────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: ValidationError[];
  meta?: PaginationMeta;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ─── Auth Service Return Types ────────────────────────────────────────────────
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult {
  user: SafeUser;
  tokens: TokenPair;
}

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  createdAt: Date;
}

// ─── Audit Log ────────────────────────────────────────────────────────────────
export interface AuditEvent {
  userId?: string;
  action: string;
  ip: string;
  userAgent: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}
