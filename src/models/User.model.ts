import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser, UserRole } from '../types';
import { env } from '../config/env';

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Never returned by default
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationExpiry: {
      type: Date,
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpiry: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        ret['id'] = ret['_id'];
        ret['_id'] = undefined;
        ret['__v'] = undefined;
        ret['password'] = undefined;
        ret['refreshToken'] = undefined;
        ret['emailVerificationToken'] = undefined;
        ret['passwordResetToken'] = undefined;
        return ret;
      },
    },
  },
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
UserSchema.index({ passwordResetToken: 1 }, { sparse: true });
UserSchema.index({ emailVerificationToken: 1 }, { sparse: true });

// ─── Pre-save: Hash password ──────────────────────────────────────────────────
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    this.password = await bcrypt.hash(this.password, env.BCRYPT_SALT_ROUNDS);
    next();
  } catch (err) {
    next(err as Error);
  }
});

// ─── Method: Compare password ─────────────────────────────────────────────────
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// ─── Method: Increment login attempts ────────────────────────────────────────
UserSchema.methods.incLoginAttempts = async function (): Promise<void> {
  const lockTime = env.LOCK_TIME_MINUTES * 60 * 1000;

  // Reset attempts if lock has expired
  if (this.lockUntil && this.lockUntil < new Date()) {
    await this.updateOne({
      $set: { loginAttempts: 1, isLocked: false },
      $unset: { lockUntil: 1 },
    });
    return;
  }

  const newAttempts = this.loginAttempts + 1;

  if (newAttempts >= env.MAX_LOGIN_ATTEMPTS) {
    await this.updateOne({
      loginAttempts: newAttempts,
      isLocked: true,
      lockUntil: new Date(Date.now() + lockTime),
    });
  } else {
    await this.updateOne({ loginAttempts: newAttempts });
  }
};

// ─── Method: Reset login attempts ────────────────────────────────────────────
UserSchema.methods.resetLoginAttempts = async function (): Promise<void> {
  await this.updateOne({
    $set: { loginAttempts: 0, isLocked: false },
    $unset: { lockUntil: 1 },
  });
};

// ─── Method: Check account lock ───────────────────────────────────────────────
UserSchema.methods.isAccountLocked = function (): boolean {
  if (!this.isLocked) return false;
  if (this.lockUntil && this.lockUntil < new Date()) return false;
  return true;
};

export const User = mongoose.model<IUser>('User', UserSchema);
