import rateLimit from 'express-rate-limit';
import { sendError } from '../utils/response';

const createLimiter = (windowMs: number, max: number, message: string) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
      sendError(res, message, 429);
    },
  });

// Strict limiter for auth endpoints
export const authLimiter = createLimiter(
  15 * 60 * 1000, // 15 minutes
  10,
  'Too many authentication attempts. Please try again in 15 minutes.',
);

// Very strict for forgot-password (prevent abuse)
export const forgotPasswordLimiter = createLimiter(
  60 * 60 * 1000, // 1 hour
  3,
  'Too many password reset requests. Please try again in 1 hour.',
);

// General API limiter
export const apiLimiter = createLimiter(
  60 * 1000, // 1 minute
  60,
  'Too many requests from this IP. Please slow down.',
);
