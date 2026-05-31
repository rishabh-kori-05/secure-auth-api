import dotenv from 'dotenv';

dotenv.config();

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function optionalEnv(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

export const env = {
  NODE_ENV: optionalEnv('NODE_ENV', 'development'),
  PORT: parseInt(optionalEnv('PORT', '5000'), 10),
  API_VERSION: optionalEnv('API_VERSION', 'v1'),

  MONGODB_URI: requireEnv('MONGODB_URI'),

  JWT_ACCESS_SECRET: requireEnv('JWT_ACCESS_SECRET'),
  JWT_REFRESH_SECRET: requireEnv('JWT_REFRESH_SECRET'),
  JWT_ACCESS_EXPIRY: optionalEnv('JWT_ACCESS_EXPIRY', '15m'),
  JWT_REFRESH_EXPIRY: optionalEnv('JWT_REFRESH_EXPIRY', '7d'),

  SMTP_HOST: optionalEnv('SMTP_HOST', 'smtp.gmail.com'),
  SMTP_PORT: parseInt(optionalEnv('SMTP_PORT', '587'), 10),
  SMTP_USER: optionalEnv('SMTP_USER', ''),
  SMTP_PASS: optionalEnv('SMTP_PASS', ''),
  EMAIL_FROM: optionalEnv('EMAIL_FROM', 'noreply@yourapp.com'),

  CLIENT_URL: optionalEnv('CLIENT_URL', 'http://localhost:3000'),

  BCRYPT_SALT_ROUNDS: parseInt(optionalEnv('BCRYPT_SALT_ROUNDS', '12'), 10),
  MAX_LOGIN_ATTEMPTS: parseInt(optionalEnv('MAX_LOGIN_ATTEMPTS', '5'), 10),
  LOCK_TIME_MINUTES: parseInt(optionalEnv('LOCK_TIME_MINUTES', '30'), 10),

  get isDev() {
    return this.NODE_ENV === 'development';
  },
  get isProd() {
    return this.NODE_ENV === 'production';
  },
} as const;
