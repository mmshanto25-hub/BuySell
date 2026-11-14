import { test, describe } from 'node:test';
import assert from 'node:assert';
import { ReturnService } from './return.service';

describe('Phase 5: Returns, Refunds & Dispute Arbitration Engine', () => {
  const mockCustomerId = 'usr_customer_01';
  const mockStoreId = 'store_apex';
  const mockSubOrderNumber = 'ORD-20261114-K89X-S1';
  let createdReturnId = '';

  test('5.8 - Customer submits return request with item details and evidence photos', async () => {
    const returnReq = await ReturnService.createReturnRequest(mockCustomerId, {
      subOrderNumber: mockSubOrderNumber,
      items: [
        {
          orderItemId: 'item_apex_01',
          quantity: 1,
          reason: 'SIZE_FIT',
          details: 'Shoe size 42 was slightly too narrow across the welt',
          images: ['https://cdn.marketplace.com/evidence/photo_01.jpg'],
        },
      ],
    });

    assert.ok(returnReq);
    assert.match(returnReq.returnNumber, /^RET-\d{6}-[A-Z0-9]+$/);
    assert.strictEqual(returnReq.status, 'REQUESTED');
    assert.strictEqual(returnReq.subOrderNumber, mockSubOrderNumber);
    assert.ok(returnReq.refundAmount > 0);

    createdReturnId = returnReq.returnNumber;
  });

  test('5.9 - Seller contests return claim with audit rationale', async () => {
    const response = await ReturnService.sellerRespond(
      mockStoreId,
      createdReturnId,
      'CONTEST',
      'Original shoe box seal reported broken by delivery rider'
    );

    assert.ok(response);
    assert.strictEqual(response.status, 'SELLER_CONTESTED');
  });

  test('5.10 - Admin / Support agent reviews evidence and arbitrates dispute in favor of customer', async () => {
    const adminArbitration = await ReturnService.arbitrateDispute(
      'usr_admin',
      createdReturnId,
      'REFUND_BUYER',
      'Buyer uploaded unboxing video showing inner packaging intact. Buyer protection policy applied.'
    );

    assert.ok(adminArbitration);
    assert.strictEqual(adminArbitration.status, 'REFUNDED');
    assert.ok(adminArbitration.resolvedAt);
  });

  test('5.11 - Seller confirms inspection of returned item and triggers stock replenishment', async () => {
    const inspection = await ReturnService.confirmInspectionAndRefund(mockStoreId, createdReturnId);

    assert.ok(inspection);
    assert.strictEqual(inspection.status, 'REFUNDED');
    assert.match(inspection.message, /Goods inspected and restocked/);
  });
});
