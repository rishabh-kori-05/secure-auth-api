import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { sendError } from '../utils/response';
import { ValidationError } from '../types';

export function validate(req: Request, res: Response, next: NextFunction): void {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    const errors: ValidationError[] = result.array().map((err) => ({
      field: err.type === 'field' ? err.path : 'general',
      message: err.msg as string,
    }));

    sendError(res, 'Validation failed', 422, errors);
    return;
  }

  next();
}
