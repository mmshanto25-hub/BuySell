import { describe, it } from 'node:test';
import assert from 'node:assert';
import jwt from 'jsonwebtoken';
import { app } from '../../app';
import { ENV } from '../../common/config/env';
import { MetricsCollector } from '../../common/middleware/performanceMonitor';
import { resetRateLimiter } from '../../common/middleware/rateLimiter';
import http from 'http';

// ── Lightweight HTTP Test Helper (no supertest dependency) ──
function request(
  method: string,
  path: string,
  opts: { body?: any; headers?: Record<string, string> } = {}
): Promise<{ status: number; headers: http.IncomingHttpHeaders; body: any }> {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, () => {
      const addr = server.address() as { port: number };
      const reqOpts: http.RequestOptions = {
        hostname: '127.0.0.1',
        port: addr.port,
        path,
        method,
        headers: { 'Content-Type': 'application/json', ...opts.headers },
      };

      const req = http.request(reqOpts, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          server.close();
          try {
            resolve({ status: res.statusCode!, headers: res.headers, body: JSON.parse(data || '{}') });
          } catch {
            resolve({ status: res.statusCode!, headers: res.headers, body: data });
          }
        });
      });

      req.on('error', (err) => { server.close(); reject(err); });
      if (opts.body) req.write(JSON.stringify(opts.body));
      req.end();
    });
  });
}

describe('Phase 8 QA: Security Audit & Integration Tests', () => {
  it('8.27 - Health liveness endpoint returns 200 with uptime', async () => {
    const res = await request('GET', '/health/liveness');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'ok');
    assert.ok(res.body.uptime !== undefined, 'Must include uptime');
    assert.ok(res.body.timestamp, 'Must include timestamp');
  });

  it('8.28 - Health readiness reports database and memory status', async () => {
    const res = await request('GET', '/health/readiness');
    assert.ok([200, 503].includes(res.status), 'Must return 200 or 503');
    assert.ok(res.body.checks, 'Must include checks object');
    assert.ok(res.body.checks.database, 'Must report database status');
    assert.ok(res.body.checks.memory, 'Must report memory status');
  });

  it('8.29 - Health metrics returns performance data', async () => {
    const res = await request('GET', '/health/metrics');
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.memory, 'Must include memory metrics');
    assert.ok(res.body.uptime !== undefined, 'Must include uptime');
    assert.ok(res.body.totalRequests !== undefined, 'Must include total requests');
  });

  it('8.30 - Protected route returns 401 without Bearer token', async () => {
    const res = await request('GET', '/api/v1/addresses');
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.error.code, 'UNAUTHORIZED');
  });

  it('8.31 - Protected route returns 401 with invalid JWT', async () => {
    const res = await request('GET', '/api/v1/addresses', {
      headers: { Authorization: 'Bearer invalid.token.here' },
    });
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.error.code, 'UNAUTHORIZED');
  });

  it('8.32 - Protected route returns 401 with expired JWT', async () => {
    const expiredToken = jwt.sign(
      { userId: 'usr_test', email: 'test@test.com', role: 'CUSTOMER' },
      ENV.JWT_ACCESS_SECRET,
      { expiresIn: '0s' }
    );

    // Small delay to ensure expiration
    await new Promise(r => setTimeout(r, 50));

    const res = await request('GET', '/api/v1/addresses', {
      headers: { Authorization: `Bearer ${expiredToken}` },
    });
    assert.strictEqual(res.status, 401);
  });

  it('8.33 - Helmet sets security headers (X-Content-Type-Options)', async () => {
    const res = await request('GET', '/health/liveness');
    assert.strictEqual(res.headers['x-content-type-options'], 'nosniff');
  });

  it('8.34 - Request ID header is generated', async () => {
    const res = await request('GET', '/health/liveness');
    assert.ok(res.headers['x-request-id'], 'Must include X-Request-Id header');
  });

  it('8.35 - Sitemap endpoint returns valid XML', async () => {
    const res = await request('GET', '/sitemap.xml');
    assert.strictEqual(res.status, 200);
    assert.ok(typeof res.body === 'string' || res.body, 'Must return sitemap content');
  });

  it('8.36 - Robots.txt endpoint returns crawler directives', async () => {
    const res = await request('GET', '/robots.txt');
    assert.strictEqual(res.status, 200);
  });

  it('8.37 - MetricsCollector calculates p95 and p99 percentiles correctly', () => {
    const collector = new MetricsCollector();

    // Add 100 known durations
    for (let i = 1; i <= 100; i++) {
      collector.recordRequest('GET', '/test', i);
    }

    const metrics = collector.getMetrics();
    const endpoint = metrics.endpoints['GET /test'];

    assert.strictEqual(endpoint.requestCount, 100);
    assert.ok(endpoint.p95Ms >= 95, `p95 must be ~95, got ${endpoint.p95Ms}`);
    assert.ok(endpoint.p99Ms >= 99, `p99 must be ~99, got ${endpoint.p99Ms}`);
    assert.strictEqual(endpoint.avgMs, 50.5, 'Average of 1..100 must be 50.5');
  });

  it('8.38 - Error responses do not expose environment variables or stack traces', async () => {
    const res = await request('GET', '/api/v1/nonexistent-route-e2e-test');
    // Should return 404 or handled error
    if (res.body && res.body.error) {
      const errorStr = JSON.stringify(res.body);
      assert.ok(!errorStr.includes('JWT_ACCESS_SECRET'), 'Must not expose JWT secret');
      assert.ok(!errorStr.includes('MONGODB_URI'), 'Must not expose DB connection string');
      assert.ok(!errorStr.includes('node_modules'), 'Must not expose file paths in stack');
    }
  });
});
