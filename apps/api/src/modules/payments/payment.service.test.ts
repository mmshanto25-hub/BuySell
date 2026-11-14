import { test, describe } from 'node:test';
import assert from 'node:assert';
import crypto from 'crypto';
import { PaymentService } from './payment.service';

describe('Phase 5: Payment Gateway & Idempotent Webhook Engine', () => {
  const mockOrderNumber = 'ORD-20261114-TESTPAY';

  test('5.1 - Initiate payment creates pending session with gateway redirect URL', async () => {
    const session = await PaymentService.initiatePayment(mockOrderNumber, 'BKASH');

    assert.ok(session, 'Payment session must be created');
    assert.strictEqual(session.orderNumber, mockOrderNumber);
    assert.strictEqual(session.gateway, 'BKASH');
    assert.strictEqual(session.status, 'PENDING');
    assert.ok(session.paymentUrl, 'bKash gateway checkout redirect URL must be generated');
    assert.match(session.paymentUrl, /tokenized\.sandbox\.bka\.sh/, 'Payment URL must point to tokenized bKash sandbox');
  });

  test('5.2 - HMAC SHA-256 signature verification accepts valid hash and rejects tampered data', () => {
    const secret = 'super_secret_webhook_key_2026';
    const payload = JSON.stringify({ orderNumber: mockOrderNumber, trxID: 'TRX-123456', amount: 10290 });

    const validSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    const isVerified = PaymentService.verifyHmacSignature(payload, validSignature, secret);
    assert.strictEqual(isVerified, true, 'Valid signature must verify successfully');

    const tamperedPayload = JSON.stringify({ orderNumber: mockOrderNumber, trxID: 'TRX-123456', amount: 100 });
    const isTampered = PaymentService.verifyHmacSignature(tamperedPayload, validSignature, secret);
    assert.strictEqual(isTampered, false, 'Tampered payload must fail signature verification');
  });

  test('5.3 - Idempotent webhook confirmation settles payment and prevents duplicate processing', async () => {
    const trxId = 'TRX-BKASH-' + Date.now();

    // 1st Webhook Execution
    const firstResult = await PaymentService.handleWebhook('BKASH', {
      orderNumber: mockOrderNumber,
      transactionId: trxId,
      amount: 10290,
    });

    assert.strictEqual(firstResult.idempotent, false, 'First callback must be processed normally');
    assert.strictEqual(firstResult.paymentStatus, 'PAID');
    assert.ok((firstResult.subOrdersConfirmed ?? 0) >= 1, 'Child sub-orders must advance to confirmed');

    // 2nd Webhook Execution (Simulating duplicate network replay)
    const duplicateResult = await PaymentService.handleWebhook('BKASH', {
      orderNumber: mockOrderNumber,
      transactionId: trxId,
      amount: 10290,
    });

    assert.strictEqual(duplicateResult.idempotent, true, 'Duplicate webhook must be identified as idempotent replay');
    assert.strictEqual(duplicateResult.paymentStatus, 'PAID');
    assert.match(duplicateResult.message, /Idempotent replay detected/);
  });

  test('5.4 - Payment status inquiry returns current verified settlement status', async () => {
    const status = await PaymentService.getPaymentStatus(mockOrderNumber);

    assert.ok(status);
    assert.strictEqual(status.orderNumber, mockOrderNumber);
    assert.strictEqual(status.paymentStatus, 'PAID');
    assert.strictEqual(status.orderStatus, 'PROCESSING');
  });
});
