/**
 * Token-bucket rate limiter middleware (in-memory, zero external dependencies).
 * Usage: app.use('/api/v1/auth', rateLimiter(10, 60_000));  // 10 req/min on auth
 */

import { Request, Response, NextFunction } from 'express';

interface BucketEntry {
  tokens: number;
  lastRefill: number;
}

const buckets: Map<string, BucketEntry> = new Map();

// Auto-cleanup expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of buckets) {
    if (now - entry.lastRefill > 600_000) {
      buckets.delete(key);
    }
  }
}, 300_000).unref();

export function rateLimiter(maxRequests = 100, windowMs = 60_000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `${clientIp}:${req.baseUrl}`;
    const now = Date.now();

    let bucket = buckets.get(key);

    if (!bucket) {
      bucket = { tokens: maxRequests, lastRefill: now };
      buckets.set(key, bucket);
    }

    // Refill tokens based on elapsed time
    const elapsed = now - bucket.lastRefill;
    const refillRate = maxRequests / windowMs; // tokens per ms
    const tokensToAdd = elapsed * refillRate;
    bucket.tokens = Math.min(maxRequests, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;

    if (bucket.tokens < 1) {
      const retryAfterSec = Math.ceil(windowMs / 1000);
      res.setHeader('Retry-After', String(retryAfterSec));
      res.setHeader('X-RateLimit-Limit', String(maxRequests));
      res.setHeader('X-RateLimit-Remaining', '0');
      return res.status(429).json({
        success: false,
        statusCode: 429,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests. Please try again later.',
        },
        timestamp: new Date().toISOString(),
      });
    }

    bucket.tokens -= 1;

    res.setHeader('X-RateLimit-Limit', String(maxRequests));
    res.setHeader('X-RateLimit-Remaining', String(Math.floor(bucket.tokens)));
    next();
  };
}

/** Reset all buckets (for testing) */
export function resetRateLimiter() {
  buckets.clear();
}
