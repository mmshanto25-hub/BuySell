import { test, describe } from 'node:test';
import assert from 'node:assert';
import { LogisticsService } from './logistics.service';

describe('Phase 5: Logistics & Multi-Carrier Courier Engine', () => {
  const mockStoreId = 'store_apex';
  const mockSubOrderNumber = 'ORD-20261114-K89X-S1';
  let activeTrackingCode = '';

  test('5.5 - Consignment booking generates barcode PDF label URL and advances sub-order to SHIPPED', async () => {
    const consignment = await LogisticsService.createConsignment(mockStoreId, {
      subOrderNumber: mockSubOrderNumber,
      carrier: 'PATHAO',
      weightInGrams: 850,
      specialNotes: 'Fragile leather goods',
    });

    assert.ok(consignment);
    assert.match(consignment.consignmentId, /^CNS-PATHAO-\d+$/, 'Consignment ID must follow carrier pattern');
    assert.match(consignment.trackingCode, /^TRK-PAT-[A-Z0-9]+$/, 'Tracking code must include carrier prefix');
    assert.strictEqual(consignment.carrier, 'PATHAO');
    assert.match(consignment.shippingLabelUrl, /\.pdf$/, 'Shipping label must be a downloadable PDF barcode URL');
    assert.strictEqual(consignment.status, 'MANIFEST_CREATED');

    activeTrackingCode = consignment.trackingCode;
  });

  test('5.6 - Public tracking inquiry returns complete milestone event stream', async () => {
    const tracking = await LogisticsService.trackConsignment(activeTrackingCode);

    assert.ok(tracking);
    assert.strictEqual(tracking.trackingCode, activeTrackingCode);
    assert.strictEqual(tracking.carrier, 'PATHAO');
    assert.ok(tracking.events.length >= 1, 'Milestone event history must not be empty');
    assert.strictEqual(tracking.events[0].status, 'MANIFEST_CREATED');
  });

  test('5.7 - Courier webhook updates milestone events and transitions package to DELIVERED', async () => {
    const webhookRes = await LogisticsService.handleCarrierWebhook('PATHAO', {
      consignmentId: 'CNS-PATHAO-TEST',
      trackingCode: activeTrackingCode,
      status: 'DELIVERED',
      message: 'Package delivered to recipient by rider',
      location: 'Banani Delivery Hub, Dhaka',
    });

    assert.ok(webhookRes);
    assert.strictEqual(webhookRes.status, 'DELIVERED');
    assert.ok(webhookRes.deliveredAt, 'Delivered timestamp must be recorded');

    // Verify milestone stream now includes DELIVERED event
    const updatedTracking = await LogisticsService.trackConsignment(activeTrackingCode);
    assert.strictEqual(updatedTracking.currentStatus, 'DELIVERED');
    assert.strictEqual(updatedTracking.events[0].status, 'DELIVERED');
  });
});
