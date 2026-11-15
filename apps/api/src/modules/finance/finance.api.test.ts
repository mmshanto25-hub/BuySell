import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import http from 'http';
import jwt from 'jsonwebtoken';
import { app } from '../../app';
import { ENV } from '../../common/config/env';

describe('Phase 6 Live HTTP REST Integration Probe', () => {
  let server: http.Server;
  let baseUrl: string;

  const adminToken = jwt.sign(
    { userId: 'admin_test_1', email: 'superadmin@marketplace.com', role: 'SUPER_ADMIN' },
    ENV.JWT_ACCESS_SECRET,
    { expiresIn: '1h' }
  );

  const financeToken = jwt.sign(
    { userId: 'fin_test_1', email: 'finance@marketplace.com', role: 'FINANCE_MANAGER' },
    ENV.JWT_ACCESS_SECRET,
    { expiresIn: '1h' }
  );

  const sellerToken = jwt.sign(
    {
      userId: 'seller_test_1',
      sellerId: 'seller_apex',
      storeId: 'store_apex',
      email: 'seller@apex.com',
      role: 'SELLER',
    },
    ENV.JWT_ACCESS_SECRET,
    { expiresIn: '1h' }
  );

  before(async () => {
    server = http.createServer(app);
    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        const addr = server.address() as any;
        baseUrl = `http://127.0.0.1:${addr.port}`;
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  test('Probe 1: GET /api/v1/finance/overview returns financial metrics (200 OK)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/finance/overview`, {
      headers: { Authorization: `Bearer ${financeToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body: any = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.data.grossMerchandiseValue > 0);
    assert.ok(body.data.platformCommissions > 0);
  });

  test('Probe 2: GET /api/v1/finance/reconciliation verifies zero ledger variance (200 OK)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/finance/reconciliation`, {
      headers: { Authorization: `Bearer ${financeToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body: any = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.isConserved, true);
    assert.strictEqual(body.data.variance, 0);
  });

  test('Probe 3: POST /api/v1/finance/escrow-releases/run triggers automated clearance (200 OK)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/finance/escrow-releases/run`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${financeToken}`, 'Content-Type': 'application/json' },
    });
    assert.strictEqual(res.status, 200);
    const body: any = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.data.eligibleCount >= 0);
  });

  test('Probe 4: GET /api/v1/seller/wallet retrieves balances and statement (200 OK)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/seller/wallet`, {
      headers: { Authorization: `Bearer ${sellerToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body: any = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.data.wallet);
  });

  test('Probe 5: POST /api/v1/seller/settlements submits withdrawal request (201 Created)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/seller/settlements`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${sellerToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 2500,
        payoutMethod: 'BANK_TRANSFER',
      }),
    });
    assert.strictEqual(res.status, 201);
    const body: any = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.status, 'REQUESTED');
    assert.strictEqual(body.data.amountRequested, 2500);
  });

  test('Probe 6: GET /api/v1/seller/settlements returns payout history (200 OK)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/seller/settlements`, {
      headers: { Authorization: `Bearer ${sellerToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body: any = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(Array.isArray(body.data));
  });

  test('Probe 7: GET /api/v1/admin/finance/settlements returns authorization queue (200 OK)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/admin/finance/settlements`, {
      headers: { Authorization: `Bearer ${financeToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body: any = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(Array.isArray(body.data));
  });

  test('Probe 8: PATCH /api/v1/admin/finance/settlements/:id/review authorizes disbursement (200 OK)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/admin/finance/settlements/SETTLE-202611-0041/review`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${financeToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'APPROVE',
        bankTransactionRef: 'WIRE-BRAC-20261115-9981',
      }),
    });
    assert.strictEqual(res.status, 200);
    const body: any = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.status, 'DISBURSED');
  });

  test('Probe 9: GET /api/v1/admin/analytics/overview returns executive platform KPIs (200 OK)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/admin/analytics/overview`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body: any = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.data.gmv > 0);
    assert.ok(body.data.activeUsers > 0);
  });

  test('Probe 10: GET /api/v1/admin/audit-logs retrieves platform audit logs (200 OK)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/admin/audit-logs`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body: any = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(Array.isArray(body.data));
  });
});
