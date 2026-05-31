import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';
import { MongoError } from 'mongodb';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';
import { env } from '../config/env';

function handleMongooseValidationError(err: MongooseError.ValidationError): AppError {
  const messages = Object.values(err.errors).map((e) => e.message);
  return AppError.badRequest(messages.join('. '));
}

function handleMongoDuplicateKey(err: MongoError & { keyValue?: Record<string, unknown> }): AppError {
  const field = Object.keys(err.keyValue ?? {})[0] ?? 'field';
  return AppError.conflict(`${field} already exists`);
}

function handleCastError(err: MongooseError.CastError): AppError {
  return AppError.badRequest(`Invalid ${err.path}: ${err.value}`);
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  let error: AppError;

  if (err instanceof AppError) {
    error = err;
  } else if (err instanceof MongooseError.ValidationError) {
    error = handleMongooseValidationError(err);
  } else if (err instanceof MongooseError.CastError) {
    error = handleCastError(err);
  } else if (err instanceof MongoError && err.code === 11000) {
    error = handleMongoDuplicateKey(err as MongoError & { keyValue?: Record<string, unknown> });
  } else if (err instanceof TokenExpiredError) {
    error = AppError.unauthorized('Token has expired');
  } else if (err instanceof JsonWebTokenError) {
    error = AppError.unauthorized('Invalid token');
  } else {
    const message = err instanceof Error ? err.message : 'Internal server error';
    error = AppError.internal(message);
  }

  // Log server errors
  if (error.statusCode >= 500) {
    logger.error('Server error:', err);
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    ...(env.isDev && error.statusCode >= 500 && { stack: error.stack }),
  });
}

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(AppError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
}
