import winston from 'winston';
import { env } from '../config/env';

const { combine, timestamp, errors, json, colorize, printf } = winston.format;

const devFormat = printf(({ level, message, timestamp: ts, stack }) => {
  return `${ts} [${level}]: ${stack ?? message}`;
});

const prodFormat = combine(timestamp(), errors({ stack: true }), json());

const devFormatFull = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  devFormat,
);

export const logger = winston.createLogger({
  level: env.isDev ? 'debug' : 'info',
  format: env.isProd ? prodFormat : devFormatFull,
  transports: [
    new winston.transports.Console(),
    ...(env.isProd
      ? [
          new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
          new winston.transports.File({ filename: 'logs/combined.log' }),
        ]
      : []),
  ],
  exitOnError: false,
});
