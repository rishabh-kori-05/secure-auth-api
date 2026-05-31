import { Request } from 'express';
import { logger } from './logger';
import { AuditEvent } from '../types';

export function auditLog(req: Request, action: string, metadata?: Record<string, unknown>): void {
  const event: AuditEvent = {
    action,
    ip: (req.headers['x-forwarded-for'] as string) ?? req.socket.remoteAddress ?? 'unknown',
    userAgent: req.headers['user-agent'] ?? 'unknown',
    timestamp: new Date(),
    metadata,
  };

  logger.info('AUDIT', event);
}
