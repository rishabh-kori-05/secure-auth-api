
import { User } from '../models/User.model';
import { AppError } from '../utils/AppError';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/token';
import { generateSecureToken, hashToken } from '../utils/crypto';
import { emailService } from './email.service';
import { AuthResult, IUser, SafeUser, TokenPair } from '../types';
import { logger } from '../utils/logger';

class AuthService {
  private toSafeUser(user: IUser): SafeUser {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    };
  }

  private generateTokenPair(user: IUser): TokenPair {
    const accessToken = generateAccessToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });
    const refreshToken = generateRefreshToken(user._id.toString());
    return { accessToken, refreshToken };
  }

  async register(name: string, email: string, password: string): Promise<{ user: SafeUser }> {
    const existing = await User.findOne({ email });
    if (existing) throw AppError.conflict('Email is already registered');

    const verificationToken = generateSecureToken();
    const hashedToken = hashToken(verificationToken);

    const user = await User.create({
      name,
      email,
      password,
      emailVerificationToken: hashedToken,
      emailVerificationExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
    });

    // Send verification email (non-blocking in dev)
    emailService.sendVerificationEmail(user.email, user.name, verificationToken).catch((err) => {
      logger.error('Verification email failed:', err);
    });

    logger.info(`New user registered: ${email}`);
    return { user: this.toSafeUser(user) };
  }

  async login(email: string, password: string): Promise<AuthResult> {
    const user = await User.findOne({ email }).select(
      '+password +loginAttempts +lockUntil +isLocked +refreshToken',
    );

    if (!user) throw AppError.unauthorized('Invalid credentials');

    if (user.isAccountLocked()) {
      const lockExpiry = user.lockUntil
        ? `until ${user.lockUntil.toISOString()}`
        : 'temporarily';
      throw AppError.tooManyRequests(`Account locked ${lockExpiry}. Try again later.`);
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      await user.incLoginAttempts();
      const attemptsLeft = Math.max(0, 5 - (user.loginAttempts + 1));
      throw AppError.unauthorized(
        attemptsLeft > 0
          ? `Invalid credentials. ${attemptsLeft} attempt(s) remaining.`
          : 'Account locked due to too many failed attempts.',
      );
    }

    // Reset failed attempts on success
    await user.resetLoginAttempts();

    const tokens = this.generateTokenPair(user);

    // Store hashed refresh token
    user.refreshToken = hashToken(tokens.refreshToken);
    await user.save({ validateBeforeSave: false });

    logger.info(`User logged in: ${email}`);
    return { user: this.toSafeUser(user), tokens };
  }

  async logout(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
    logger.info(`User logged out: ${userId}`);
  }

  async refreshTokens(incomingRefreshToken: string): Promise<TokenPair> {
    let payload;
    try {
      payload = verifyRefreshToken(incomingRefreshToken);
    } catch {
      throw AppError.unauthorized('Invalid or expired refresh token');
    }

    const user = await User.findById(payload.sub).select('+refreshToken');
    if (!user || !user.refreshToken) throw AppError.unauthorized('Session not found');

    const hashedIncoming = hashToken(incomingRefreshToken);
    if (hashedIncoming !== user.refreshToken) {
      // Refresh token reuse detected — invalidate session
      await User.findByIdAndUpdate(payload.sub, { $unset: { refreshToken: 1 } });
      logger.warn(`Refresh token reuse detected for user: ${payload.sub}`);
      throw AppError.unauthorized('Token reuse detected. Please log in again.');
    }

    // Rotate tokens
    const tokens = this.generateTokenPair(user);
    user.refreshToken = hashToken(tokens.refreshToken);
    await user.save({ validateBeforeSave: false });

    return tokens;
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await User.findOne({ email });

    // Always return success to prevent user enumeration
    if (!user) return;

    const resetToken = generateSecureToken();
    const hashedToken = hashToken(resetToken);

    user.passwordResetToken = hashedToken;
    user.passwordResetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1h
    await user.save({ validateBeforeSave: false });

    emailService.sendPasswordResetEmail(user.email, user.name, resetToken).catch((err) => {
      logger.error('Password reset email failed:', err);
    });

    logger.info(`Password reset requested for: ${email}`);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const hashedToken = hashToken(token);

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpiry: { $gt: new Date() },
    }).select('+passwordResetToken +passwordResetExpiry');

    if (!user) throw AppError.badRequest('Invalid or expired reset token');

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;
    // Invalidate all refresh tokens on password reset
    user.refreshToken = undefined;
    await user.save();

    logger.info(`Password reset successful for: ${user.email}`);
  }

  async verifyEmail(token: string): Promise<void> {
    const hashedToken = hashToken(token);

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpiry: { $gt: new Date() },
    }).select('+emailVerificationToken +emailVerificationExpiry');

    if (!user) throw AppError.badRequest('Invalid or expired verification token');
    if (user.isVerified) throw AppError.conflict('Email is already verified');

    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    logger.info(`Email verified for: ${user.email}`);
  }
}

export const authService = new AuthService();
