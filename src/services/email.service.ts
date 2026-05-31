import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../utils/logger';

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }

  private async send(options: MailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"Secure Auth API" <${env.EMAIL_FROM}>`,
        ...options,
      });
      logger.info(`Email sent to ${options.to}: ${options.subject}`);
    } catch (err) {
      logger.error(`Email send failed to ${options.to}:`, err);
      // Don't throw — email failures shouldn't break the auth flow in dev
      if (env.isProd) throw err;
    }
  }

  async sendVerificationEmail(email: string, name: string, token: string): Promise<void> {
    const verifyUrl = `${env.CLIENT_URL}/verify-email?token=${token}`;
    await this.send({
      to: email,
      subject: 'Verify Your Email Address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Email Verification</h2>
          <p>Hi ${name},</p>
          <p>Please verify your email address by clicking the button below.</p>
          <p>This link expires in <strong>24 hours</strong>.</p>
          <a href="${verifyUrl}" style="
            display: inline-block;
            padding: 12px 24px;
            background-color: #4F46E5;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            margin: 16px 0;
          ">Verify Email</a>
          <p>Or copy this link: <code>${verifyUrl}</code></p>
          <p>If you didn't create an account, you can safely ignore this email.</p>
        </div>
      `,
    });
  }

  async sendPasswordResetEmail(email: string, name: string, token: string): Promise<void> {
    const resetUrl = `${env.CLIENT_URL}/reset-password?token=${token}`;
    await this.send({
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset</h2>
          <p>Hi ${name},</p>
          <p>You requested a password reset. Click the button below to proceed.</p>
          <p>This link expires in <strong>1 hour</strong>.</p>
          <a href="${resetUrl}" style="
            display: inline-block;
            padding: 12px 24px;
            background-color: #DC2626;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            margin: 16px 0;
          ">Reset Password</a>
          <p>Or copy this link: <code>${resetUrl}</code></p>
          <p><strong>If you did not request this, please secure your account immediately.</strong></p>
        </div>
      `,
    });
  }
}

export const emailService = new EmailService();
