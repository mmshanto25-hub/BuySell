/**
 * APM / Performance monitoring middleware & MetricsCollector
 * - Per-endpoint metrics aggregation (avg, p95, p99)
 * - Memory usage tracking
 * - Active request counter
 * - Slow request detection
 */

import { Request, Response, NextFunction } from 'express';

interface EndpointMetric {
  count: number;
  totalMs: number;
  durations: number[];
}

export class MetricsCollector {
  private endpoints: Map<string, EndpointMetric> = new Map();
  private activeRequests = 0;
  private totalRequests = 0;
  private startedAt = Date.now();
  private slowThresholdMs: number;

  constructor(slowThresholdMs = 2000) {
    this.slowThresholdMs = slowThresholdMs;
  }

  recordRequest(method: string, path: string, durationMs: number) {
    const key = `${method} ${path}`;
    let metric = this.endpoints.get(key);
    if (!metric) {
      metric = { count: 0, totalMs: 0, durations: [] };
      this.endpoints.set(key, metric);
    }
    metric.count++;
    metric.totalMs += durationMs;
    metric.durations.push(durationMs);

    // Keep last 1000 samples per endpoint to bound memory
    if (metric.durations.length > 1000) {
      metric.durations = metric.durations.slice(-1000);
    }

    this.totalRequests++;

    if (durationMs > this.slowThresholdMs) {
      console.warn(`[SLOW_REQUEST] ${key} took ${durationMs.toFixed(2)}ms (threshold: ${this.slowThresholdMs}ms)`);
    }
  }

  incrementActive() { this.activeRequests++; }
  decrementActive() { this.activeRequests = Math.max(0, this.activeRequests - 1); }

  private percentile(arr: number[], p: number): number {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const idx = Math.floor(p * sorted.length);
    return sorted[Math.min(idx, sorted.length - 1)];
  }

  getMetrics() {
    const mem = process.memoryUsage();
    const endpointStats: Record<string, any> = {};

    for (const [key, metric] of this.endpoints) {
      endpointStats[key] = {
        requestCount: metric.count,
        avgMs: metric.count > 0 ? Math.round((metric.totalMs / metric.count) * 100) / 100 : 0,
        p95Ms: Math.round(this.percentile(metric.durations, 0.95) * 100) / 100,
        p99Ms: Math.round(this.percentile(metric.durations, 0.99) * 100) / 100,
      };
    }

    return {
      uptime: Math.round((Date.now() - this.startedAt) / 1000),
      totalRequests: this.totalRequests,
      activeRequests: this.activeRequests,
      memory: {
        rss: Math.round(mem.rss / 1024 / 1024),
        heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
        heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
        external: Math.round(mem.external / 1024 / 1024),
      },
      endpoints: endpointStats,
    };
  }

  reset() {
    this.endpoints.clear();
    this.activeRequests = 0;
    this.totalRequests = 0;
    this.startedAt = Date.now();
  }
}

// Global singleton collector
export const metricsCollector = new MetricsCollector();

export function performanceMonitor(req: Request, res: Response, next: NextFunction) {
  const start = process.hrtime.bigint();
  metricsCollector.incrementActive();

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    metricsCollector.decrementActive();
    metricsCollector.recordRequest(req.method, req.route?.path || req.path, durationMs);
  });

  next();
}

export function getMetrics() {
  return metricsCollector.getMetrics();
}
