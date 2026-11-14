import { test, describe } from 'node:test';
import assert from 'node:assert';
import { CheckoutService } from './checkout.service';
import { CartService } from '../cart/cart.service';

describe('Phase 4: Multi-Vendor Split Checkout & Order Engine', () => {
  const mockUserId = 'usr_customer_test_01';
  const mockUserSnapshot = {
    name: 'Tariqul Islam',
    email: 'customer@example.com',
    phone: '+8801712345678',
  };

  test('4.1 - Cart calculation groups items by vendor with live delivery fees', async () => {
    const cart = await CartService.getOrCreateCart(mockUserId);
    assert.ok(cart, 'Cart should be created or retrieved');

    const calculated = await CartService.calculateCart(cart);
    assert.ok(calculated.sellerGroups.length >= 2, 'Cart should have multiple vendor store groups');
    assert.strictEqual(calculated.totalShippingFee, calculated.sellerGroups.length * 60, 'Shipping fee must equal ৳60 * vendor count');
    assert.ok(calculated.itemsSubtotal > 0, 'Items subtotal must be positive');
    assert.strictEqual(
      calculated.grandTotal,
      calculated.itemsSubtotal + calculated.totalShippingFee - calculated.discountAmount,
      'Grand total must equal subtotal + shipping - discount'
    );
  });

  test('4.2 - Pre-checkout validation calculates multi-vendor splits and applies coupon', async () => {
    const preVal = await CheckoutService.preValidate(mockUserId, {
      couponCode: 'PLATFORM10',
    });

    assert.strictEqual(preVal.isValid, true, 'Pre-validation should succeed');
    assert.ok(preVal.vendorCount >= 2, 'Should detect at least 2 distinct vendors');
    assert.strictEqual(preVal.totalShippingFee, preVal.vendorCount * 60, 'Delivery fee must be ৳60 per vendor');
    assert.ok(preVal.totalDiscount > 0, 'PLATFORM10 coupon should provide a positive discount');
    assert.strictEqual(
      preVal.grandTotal,
      preVal.itemsSubtotal + preVal.totalShippingFee - preVal.totalDiscount,
      'Calculated grand total must accurately reflect discount'
    );
  });

  test('4.3 - Atomic placeOrder generates 1 Parent Order and N Seller Sub-Orders with frozen snapshots', async () => {
    const orderResult = await CheckoutService.placeOrder(mockUserId, mockUserSnapshot, {
      shippingAddressId: 'addr_test_01',
      paymentMethod: 'BKASH',
      couponCode: 'PLATFORM10',
      customerNotes: 'Please ring the bell on delivery',
    });

    assert.ok(orderResult.parentOrder, 'Parent order must be generated');
    assert.match(orderResult.parentOrder.orderNumber, /^ORD-\d{8}-[A-Z0-9]+$/, 'Order number must follow standard format');
    assert.strictEqual(orderResult.parentOrder.paymentStatus, 'UNPAID', 'Initial payment status must be UNPAID');
    assert.strictEqual(orderResult.parentOrder.orderStatus, 'PENDING', 'Initial order status must be PENDING');
    assert.ok(orderResult.parentOrder.stockReservationExpiresAt, 'Must set 15-minute stock reservation window');

    // Verify sub-orders
    const subOrders = orderResult.parentOrder.subOrders;
    assert.ok(subOrders.length >= 2, 'Must split into at least 2 sub-orders');

    let sumSubtotal = 0;
    for (const so of subOrders) {
      assert.match(so.subOrderNumber, /^ORD-\d{8}-[A-Z0-9]+-S\d+$/, 'Sub-order number must have vendor suffix');
      assert.ok(so.storeId, 'Sub-order must be assigned to a vendor storeId');
      assert.strictEqual(so.shippingFee, 60, 'Sub-order shipping fee must be ৳60');
      assert.ok(so.commissionAmount > 0, 'Platform commission snapshot must be calculated');
      assert.strictEqual(
        so.sellerNetEarning,
        so.subtotal - so.commissionAmount,
        'Seller net earning must equal subtotal minus platform commission'
      );
      sumSubtotal += so.subtotal;
    }

    assert.strictEqual(sumSubtotal, orderResult.parentOrder.itemsSubtotal, 'Sum of sub-order subtotals must equal parent subtotal');
    assert.ok(orderResult.payment.paymentUrl, 'Payment URL must be initialized for bKash gateway');
  });

  test('4.4 - Order cancellation safely transitions status and releases reserved stock', async () => {
    const orderResult = await CheckoutService.placeOrder(mockUserId, mockUserSnapshot, {
      shippingAddressId: 'addr_test_02',
      paymentMethod: 'COD',
    });

    const orderNum = orderResult.parentOrder.orderNumber;
    const cancelRes = await CheckoutService.cancelOrder(mockUserId, orderNum, 'Found a better deal');

    assert.strictEqual(cancelRes.status, 'CANCELLED');
    assert.ok(cancelRes.releasedSubOrders >= 2, 'All vendor sub-orders must be cancelled and released');
  });

  test('4.5 - Seller sub-order status lifecycle progression', async () => {
    const orderResult = await CheckoutService.placeOrder(mockUserId, mockUserSnapshot, {
      shippingAddressId: 'addr_test_03',
      paymentMethod: 'BKASH',
    });

    const firstSubOrder = orderResult.parentOrder.subOrders[0];
    assert.strictEqual(firstSubOrder.status, 'PENDING');

    // Vendor transitions to PACKED with courier consignment
    const packed = await CheckoutService.updateSubOrderStatus(
      firstSubOrder.storeId,
      firstSubOrder.subOrderNumber,
      'PACKED',
      { carrier: 'PATHAO', trackingCode: 'PTH-123456', consignmentId: 'CNS-889900' }
    );
    assert.strictEqual(packed.status, 'PACKED');

    // Vendor dispatches to SHIPPED
    const shipped = await CheckoutService.updateSubOrderStatus(
      firstSubOrder.storeId,
      firstSubOrder.subOrderNumber,
      'SHIPPED'
    );
    assert.strictEqual(shipped.status, 'SHIPPED');
  });
});
