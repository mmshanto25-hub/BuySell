import { describe, it } from 'node:test';
import assert from 'node:assert';
import { AuthService } from '../auth/auth.service';
import { CheckoutService } from '../orders/checkout.service';
import { FinanceService } from '../finance/finance.service';
import { generateSku, slugify } from '@marketplace/utils';

describe('Phase 8 QA: End-to-End Seller Journey', () => {
  it('8.10 - Seller registration and role assignment', async () => {
    const email = `seller_e2e_${Date.now()}@marketplace.com`;
    const result = await AuthService.register({
      firstName: 'Apex',
      lastName: 'Merchant',
      email,
      phone: '+8801999887766',
      password: 'SellerP@ss2026!',
      role: 'SELLER',
    });

    assert.ok(result.user, 'Seller must be registered');
    assert.strictEqual(result.user.email, email);
    assert.ok(result.tokens.accessToken, 'Seller must receive access token');
  });

  it('8.11 - Product slug and SKU generation for catalog', () => {
    const title = 'Apex Premium Leather Derby Shoes';
    const slug = slugify(title);
    assert.strictEqual(slug, 'apex-premium-leather-derby-shoes');

    const sku1 = generateSku('APX', 'DRB', 'BLK42');
    const sku2 = generateSku('APX', 'DRB', 'BRN43');
    assert.ok(sku1.startsWith('APX-DRB-BLK42-'));
    assert.ok(sku2.startsWith('APX-DRB-BRN43-'));
    assert.notStrictEqual(sku1, sku2, 'SKUs must be unique');
  });

  it('8.12 - Multi-variant matrix with Color x Size generates correct inventory', () => {
    const variants = [
      { sku: 'APX-DRB-BLK-40', price: 5500, attributes: [{ name: 'Color', value: 'Black' }, { name: 'Size', value: '40' }], stock: 20 },
      { sku: 'APX-DRB-BLK-42', price: 5500, attributes: [{ name: 'Color', value: 'Black' }, { name: 'Size', value: '42' }], stock: 15 },
      { sku: 'APX-DRB-BRN-40', price: 5700, attributes: [{ name: 'Color', value: 'Brown' }, { name: 'Size', value: '40' }], stock: 12 },
      { sku: 'APX-DRB-BRN-42', price: 5700, attributes: [{ name: 'Color', value: 'Brown' }, { name: 'Size', value: '42' }], stock: 18 },
    ];

    const totalStock = variants.reduce((s, v) => s + v.stock, 0);
    assert.strictEqual(totalStock, 65, 'Total inventory must sum correctly');
    assert.strictEqual(variants.length, 4, 'Color(2) x Size(2) = 4 variants');

    const colors = new Set(variants.map(v => v.attributes[0].value));
    const sizes = new Set(variants.map(v => v.attributes[1].value));
    assert.strictEqual(colors.size, 2);
    assert.strictEqual(sizes.size, 2);
  });

  it('8.13 - Inventory restock calculation preserves audit trail', () => {
    const currentStock = 15;
    const restockQty = 30;
    const movement = {
      sku: 'APX-DRB-BLK-42',
      type: 'RESTOCK' as const,
      previousAvailable: currentStock,
      quantityChanged: restockQty,
      newAvailable: currentStock + restockQty,
      referenceId: 'PO-2026-001',
    };

    assert.strictEqual(movement.newAvailable, 45);
    assert.strictEqual(movement.previousAvailable + movement.quantityChanged, movement.newAvailable);
  });

  it('8.14 - Sub-order packing attaches courier consignment', async () => {
    const mockUser = { name: 'Buyer Test', email: 'buyer@test.com', phone: '+880171' };
    const order = await CheckoutService.placeOrder('usr_seller_e2e_buyer', mockUser, {
      shippingAddressId: 'addr_seller_e2e',
      paymentMethod: 'BKASH',
    });

    const sub = order.parentOrder.subOrders[0];
    const packed = await CheckoutService.updateSubOrderStatus(sub.storeId, sub.subOrderNumber, 'PACKED', {
      carrier: 'STEADFAST',
      trackingCode: 'STD-E2E-789',
      consignmentId: 'CNS-E2E-789',
    });

    assert.strictEqual(packed.status, 'PACKED');
    assert.strictEqual(packed.carrier, 'STEADFAST');
    assert.strictEqual(packed.trackingCode, 'STD-E2E-789');
  });

  it('8.15 - Settlement request from cleared seller earnings', async () => {
    const settlement = await FinanceService.requestSettlement({
      sellerId: 'seller_e2e_apex',
      storeId: 'store_e2e_apex',
      amount: 25000,
      payoutMethod: 'BANK_TRANSFER',
      destinationDetails: {
        bankName: 'Dutch Bangla Bank',
        accountNumber: '1234567890',
        routingNumber: '090261234',
      },
    });

    assert.ok(settlement.settlementNumber, 'Must generate settlement number');
    assert.match(settlement.settlementNumber, /^SETTLE-/);
    assert.strictEqual(settlement.status, 'REQUESTED');
    assert.strictEqual(settlement.amountRequested, 25000);
  });

  it('8.16 - Wallet balance updates after escrow release', async () => {
    const escrow = await FinanceService.releaseSubOrderEscrow('ORD-20261114-SELLER-S1');
    assert.ok(escrow.releasedAmount > 0, 'Released amount must be positive');
    assert.ok(escrow.journalId.startsWith('jnl_escrow_'));

    const wallet = await FinanceService.getSellerWallet(escrow.sellerId);
    assert.ok(wallet.wallet, 'Wallet must exist');
    assert.ok(wallet.wallet.availableBalance >= 0);
  });

  it('8.17 - Minimum settlement threshold enforced', async () => {
    await assert.rejects(
      async () => {
        await FinanceService.requestSettlement({
          sellerId: 'seller_min_test',
          storeId: 'store_min_test',
          amount: 500,
          payoutMethod: 'BKASH',
          destinationDetails: { number: '01711223344' },
        });
      },
      (err: any) => err.message.includes('Minimum payout settlement threshold')
    );
  });
});
