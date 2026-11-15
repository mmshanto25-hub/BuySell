import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import http from 'http';
import jwt from 'jsonwebtoken';
import { app } from '../../app';
import { ENV } from '../../common/config/env';

describe('Phase 7 Live HTTP REST Integration Probe', () => {
  let server: http.Server;
  let baseUrl: string;

  const sellerToken = jwt.sign(
    {
      userId: 'seller_probe_1',
      sellerId: 'seller_apex',
      storeId: 'store_apex',
      email: 'merchant@apexfootwear.com',
      role: 'SELLER',
    },
    ENV.JWT_ACCESS_SECRET,
    { expiresIn: '1h' }
  );

  const customerToken = jwt.sign(
    {
      userId: 'cust_probe_1',
      email: 'buyer@example.com',
      role: 'CUSTOMER',
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

  test('Probe 1: POST /api/v1/ai/search/vector executes semantic query (200 OK)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/ai/search/vector`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'lightweight leather shoes for corporate office',
        limit: 3,
      }),
    });
    assert.strictEqual(res.status, 200);
    const body: any = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.data.results.length > 0);
  });

  test('Probe 2: POST /api/v1/ai/generate-catalog-copy assists merchant product creation (200 OK)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/ai/generate-catalog-copy`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${sellerToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productTitle: 'Handcrafted Men Leather Loafers',
        categoryName: 'Formal Footwear',
        features: ['Full-grain leather', 'Non-slip rubber sole', 'Breathable lining'],
      }),
    });
    assert.strictEqual(res.status, 200);
    const body: any = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.data.generatedSeoTitle.includes('Handcrafted Men Leather Loafers'));
  });

  test('Probe 3: POST /api/v1/ai/shopping-assistant responds with RAG recommendations (200 OK)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/ai/shopping-assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'I want traditional silk panjabi for festive eid occasion',
        budgetLimit: 8000,
      }),
    });
    assert.strictEqual(res.status, 200);
    const body: any = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.data.recommendedProducts.length > 0);
  });

  test('Probe 4: GET /api/v1/ai/recommendations/:productId returns similar items (200 OK)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/ai/recommendations/prod_apex_leather?limit=3`);
    assert.strictEqual(res.status, 200);
    const body: any = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.data.recommendations.length > 0);
  });

  test('Probe 5: POST /api/v1/reviews submits verified customer review (201 Created)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/reviews`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: 'prod_apex_leather',
        subOrderId: 'ORD-20261114-K89X-S1',
        rating: 5,
        title: 'Authentic leather quality',
        comment: 'Great craftsmanship and prompt courier delivery.',
      }),
    });
    assert.strictEqual(res.status, 201);
    const body: any = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.rating, 5);
  });

  test('Probe 6: GET /api/v1/reviews/products/:id/reviews lists ratings and breakdown (200 OK)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/reviews/products/prod_apex_leather/reviews`);
    assert.strictEqual(res.status, 200);
    const body: any = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.summary.totalReviews >= 1);
  });

  test('Probe 7: POST /api/v1/coupons/validate verifies voucher and applies discount (200 OK)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'PLATFORM10',
        cartSubtotal: 3500,
      }),
    });
    assert.strictEqual(res.status, 200);
    const body: any = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.isValid, true);
    assert.strictEqual(body.data.discountAmount, 350); // 10% of 3500
  });

  test('Probe 8: GET /sitemap.xml generates valid Google-compliant XML sitemap (200 OK)', async () => {
    const res = await fetch(`${baseUrl}/sitemap.xml`);
    assert.strictEqual(res.status, 200);
    assert.match(res.headers.get('content-type') || '', /xml/);
    const xml = await res.text();
    assert.match(xml, /<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/);
  });

  test('Probe 9: GET /robots.txt serves crawler directives with sitemap reference (200 OK)', async () => {
    const res = await fetch(`${baseUrl}/robots.txt`);
    assert.strictEqual(res.status, 200);
    const text = await res.text();
    assert.match(text, /User-agent: \*/);
    assert.match(text, /Sitemap: https:\/\/marketplace\.com\/sitemap\.xml/);
  });

  test('Probe 10: GET /api/v1/seo/metadata/product/:slug returns OpenGraph and JSON-LD (200 OK)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/seo/metadata/product/apex-mens-genuine-leather-formal-oxford-shoes`);
    assert.strictEqual(res.status, 200);
    const body: any = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.data.openGraph);
    assert.ok(body.data.jsonLd['@context']);
  });
});
