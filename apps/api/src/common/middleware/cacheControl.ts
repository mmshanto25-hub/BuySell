/**
 * Cache-control middleware factory.
 * Sets Cache-Control, ETag, and related headers per-route.
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

interface CacheOptions {
  /** Max age in seconds for Cache-Control */
  maxAge?: number;
  /** Enable stale-while-revalidate */
  staleWhileRevalidate?: number;
  /** Private (user-specific) or public caching */
  isPrivate?: boolean;
  /** Disable caching entirely */
  noCache?: boolean;
  /** Enable ETag generation based on response body */
  etag?: boolean;
}

export function cacheControl(options: CacheOptions = {}) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (options.noCache) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      return next();
    }

    const directives: string[] = [];

    if (options.isPrivate) {
      directives.push('private');
    } else {
      directives.push('public');
    }

    if (options.maxAge !== undefined) {
      directives.push(`max-age=${options.maxAge}`);
    }

    if (options.staleWhileRevalidate !== undefined) {
      directives.push(`stale-while-revalidate=${options.staleWhileRevalidate}`);
    }

    res.setHeader('Cache-Control', directives.join(', '));

    if (options.etag) {
      const originalSend = res.send.bind(res);
      res.send = function (body: any) {
        if (body && typeof body === 'string') {
          const hash = crypto.createHash('md5').update(body).digest('hex');
          res.setHeader('ETag', `"${hash}"`);
          const ifNoneMatch = req.headers['if-none-match'];
          if (ifNoneMatch === `"${hash}"`) {
            return res.status(304).end();
          }
        }
        return originalSend(body);
      } as any;
    }

    next();
  };
}
