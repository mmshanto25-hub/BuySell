/**
 * Security hardening middleware stack:
 * - NoSQL injection prevention
 * - XSS input sanitization
 * - Request ID generation
 * - Response time tracking
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// ── NoSQL Injection Prevention ──────────────────────────────
// Strips keys starting with '$' from objects to prevent MongoDB operator injection
function sanitizeObject(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeObject);

  const clean: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$')) continue; // Strip MongoDB operators
    clean[key] = sanitizeObject(obj[key]);
  }
  return clean;
}

// ── XSS Sanitization ───────────────────────────────────────
// Strips HTML tags from string values
function stripHtmlTags(value: any): any {
  if (typeof value === 'string') {
    return value.replace(/<[^>]*>/g, '');
  }
  if (Array.isArray(value)) return value.map(stripHtmlTags);
  if (value !== null && typeof value === 'object') {
    const clean: Record<string, any> = {};
    for (const key of Object.keys(value)) {
      clean[key] = stripHtmlTags(value[key]);
    }
    return clean;
  }
  return value;
}

export function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  if (req.body && typeof req.body === 'object') {
    req.body = stripHtmlTags(sanitizeObject(req.body));
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params);
  }
  next();
}

// ── Request ID ──────────────────────────────────────────────
export function requestId(req: Request, res: Response, next: NextFunction) {
  const id = (req.headers['x-request-id'] as string) || crypto.randomUUID();
  (req as any).requestId = id;
  res.setHeader('X-Request-Id', id);
  next();
}

// ── Response Time ───────────────────────────────────────────
export function responseTime(req: Request, res: Response, next: NextFunction) {
  const start = process.hrtime.bigint();
  const originalWriteHead = res.writeHead.bind(res);
  (res as any).writeHead = function (...args: any[]) {
    if (!res.headersSent) {
      const elapsed = Number(process.hrtime.bigint() - start) / 1_000_000;
      res.setHeader('X-Response-Time', `${elapsed.toFixed(2)}ms`);
    }
    return originalWriteHead.apply(res, args as any);
  };
  next();
}
