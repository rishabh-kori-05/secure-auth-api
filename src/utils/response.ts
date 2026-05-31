import { Response } from 'express';
import { ApiResponse, PaginationMeta, ValidationError } from '../types';

export function sendSuccess<T>(
  res: Response,
  message: string,
  data?: T,
  statusCode = 200,
  meta?: PaginationMeta,
): Response {
  const response: ApiResponse<T> = { success: true, message, data, meta };
  return res.status(statusCode).json(response);
}

export function sendError(
  res: Response,
  message: string,
  statusCode = 500,
  errors?: ValidationError[],
): Response {
  const response: ApiResponse = { success: false, message, errors };
  return res.status(statusCode).json(response);
}

export function sendCreated<T>(res: Response, message: string, data?: T): Response {
  return sendSuccess(res, message, data, 201);
}

export function sendNoContent(res: Response): Response {
  return res.status(204).send();
}
