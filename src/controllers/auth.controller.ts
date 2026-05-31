import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { sendSuccess, sendCreated, sendError } from '../utils/response';
import { asyncHandler } from '../middleware/asyncHandler';
import { env } from '../config/env';
import { auditLog } from '../utils/audit';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.isProd,
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body as { name: string; email: string; password: string };

  const result = await authService.register(name, email, password);
  auditLog(req, 'USER_REGISTER', { email });

  sendCreated(res, 'Registration successful. Please verify your email.', result);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };

  const result = await authService.login(email, password);
  auditLog(req, 'USER_LOGIN', { email });

  // Set refresh token in httpOnly cookie
  res.cookie('refreshToken', result.tokens.refreshToken, COOKIE_OPTIONS);

  sendSuccess(res, 'Login successful', {
    user: result.user,
    accessToken: result.tokens.accessToken,
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.body.userId as string | undefined;

  if (userId) {
    await authService.logout(userId);
    auditLog(req, 'USER_LOGOUT', { userId });
  }

  res.clearCookie('refreshToken');
  sendSuccess(res, 'Logged out successfully');
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const incomingToken = (req.cookies as { refreshToken?: string }).refreshToken
    ?? (req.body as { refreshToken?: string }).refreshToken;

  if (!incomingToken) {
    sendError(res, 'Refresh token not provided', 401);
    return;
  }

  const tokens = await authService.refreshTokens(incomingToken);

  res.cookie('refreshToken', tokens.refreshToken, COOKIE_OPTIONS);

  sendSuccess(res, 'Tokens refreshed', { accessToken: tokens.accessToken });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body as { email: string };

  await authService.forgotPassword(email);
  auditLog(req, 'FORGOT_PASSWORD', { email });

  // Always return success to prevent email enumeration
  sendSuccess(res, 'If that email is registered, a password reset link has been sent.');
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = req.body as { token: string; password: string };

  await authService.resetPassword(token, password);
  auditLog(req, 'RESET_PASSWORD');

  res.clearCookie('refreshToken');
  sendSuccess(res, 'Password has been reset successfully. Please log in.');
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.body as { token: string };

  await authService.verifyEmail(token);
  auditLog(req, 'EMAIL_VERIFIED');

  sendSuccess(res, 'Email verified successfully');
});
