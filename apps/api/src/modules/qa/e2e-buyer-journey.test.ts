import { describe, it } from 'node:test';
import assert from 'node:assert';
import { AuthService } from '../auth/auth.service';
import { CartService } from '../cart/cart.service';
import { CheckoutService } from '../orders/checkout.service';

describe('Phase 8 QA: End-to-End Buyer Journey', () => {
  const mockUserSnapshot = {
    name: 'Rahim Ahmed',
    email: 'buyer-e2e@marketplace.com',
    phone: '+8801811223344',
  };

  it('8.1 - Complete buyer registration returns valid tokens and user profile', async () => {
    const email = `buyer_e2e_${Date.now()}@marketplace.com`;
    const result = await AuthService.register({
      firstName: 'Rahim',
      lastName: 'Ahmed',
      email,
      phone: '+8801811223344',
      password: 'SecureP@ss2026!',
      role: 'CUSTOMER',
    });

    assert.ok(result.user, 'Registration must return user object');
    assert.strictEqual(result.user.email, email);
    assert.ok(result.tokens.accessToken, 'Must receive access token');
    assert.ok(result.tokens.refreshToken, 'Must receive refresh token');
    assert.strictEqual(result.tokens.expiresIn, 900, 'Access token must expire in 15 minutes');
  });

  it('8.2 - Login with valid credentials returns tokens', async () => {
    const result = await AuthService.login({
      email: 'customer@example.com',
      password: 'any-password',
    });

    assert.ok(result.user, 'Login must return user');
    assert.ok(result.tokens.accessToken, 'Must receive access token on login');
  });

  it('8.3 - Token refresh rotation issues new token pair', async () => {
    const initial = await AuthService.generateTokenPair('usr_buyer_e2e', 'buyer@test.com', 'CUSTOMER');
    const rotated = await AuthService.rotateRefreshToken(initial.refreshToken);

    assert.ok(rotated.accessToken, 'Rotation must return new access token');
    assert.ok(rotated.refreshToken, 'Rotation must return new refresh token');
    assert.notStrictEqual(rotated.refreshToken, initial.refreshToken, 'New refresh token must differ');
  });

  it('8.4 - Multi-vendor cart is created and groups items by seller', async () => {
    const userId = 'usr_e2e_buyer_01';
    const cart = await CartService.getOrCreateCart(userId);
    assert.ok(cart, 'Cart must be created');

    const calculated = await CartService.calculateCart(cart);
    assert.ok(calculated.sellerGroups.length >= 2, 'Cart must have multiple vendor groups');
    assert.ok(calculated.itemsSubtotal > 0, 'Subtotal must be positive');
    assert.ok(calculated.grandTotal > 0, 'Grand total must be positive');
  });

  it('8.5 - Cart calculation computes correct shipping per vendor', async () => {
    const userId = 'usr_e2e_buyer_02';
    const cart = await CartService.getOrCreateCart(userId);
    const calculated = await CartService.calculateCart(cart);

    assert.strictEqual(
      calculated.totalShippingFee,
      calculated.sellerGroups.length * 60,
      'Shipping must be ৳60 per vendor store'
    );
    assert.strictEqual(
      calculated.grandTotal,
      calculated.itemsSubtotal + calculated.totalShippingFee - calculated.discountAmount,
      'Grand total formula must be accurate'
    );
  });

  it('8.6 - Pre-checkout validation with coupon applies discount', async () => {
    const userId = 'usr_e2e_buyer_03';
    const preVal = await CheckoutService.preValidate(userId, { couponCode: 'PLATFORM10' });

    assert.strictEqual(preVal.isValid, true, 'Pre-validation must succeed');
    assert.ok(preVal.vendorCount >= 2, 'Must detect 2+ vendors');
    assert.ok(preVal.totalDiscount > 0, 'Coupon must provide discount');
  });

  it('8.7 - Split checkout creates parent order with N sub-orders', async () => {
    const userId = 'usr_e2e_buyer_04';
    const order = await CheckoutService.placeOrder(userId, mockUserSnapshot, {
      shippingAddressId: 'addr_e2e_01',
      paymentMethod: 'BKASH',
      couponCode: 'PLATFORM10',
    });

    assert.ok(order.parentOrder, 'Must create parent order');
    assert.match(order.parentOrder.orderNumber, /^ORD-\d{8}-[A-Z0-9]+$/);
    assert.ok(order.parentOrder.subOrders.length >= 2, 'Must split into sub-orders');
    assert.strictEqual(order.parentOrder.paymentStatus, 'UNPAID');
    assert.ok(order.payment.paymentUrl, 'Must return payment URL');
  });

  it('8.8 - Order cancellation releases all sub-orders', async () => {
    const userId = 'usr_e2e_buyer_05';
    const order = await CheckoutService.placeOrder(userId, mockUserSnapshot, {
      shippingAddressId: 'addr_e2e_02',
      paymentMethod: 'COD',
    });

    const cancelled = await CheckoutService.cancelOrder(userId, order.parentOrder.orderNumber, 'Changed my mind');
    assert.strictEqual(cancelled.status, 'CANCELLED');
    assert.ok(cancelled.releasedSubOrders >= 2, 'All sub-orders must be released');
  });

  it('8.9 - Sub-order lifecycle progresses through PACKED and SHIPPED', async () => {
    const userId = 'usr_e2e_buyer_06';
    const order = await CheckoutService.placeOrder(userId, mockUserSnapshot, {
      shippingAddressId: 'addr_e2e_03',
      paymentMethod: 'BKASH',
    });

    const sub = order.parentOrder.subOrders[0];
    const packed = await CheckoutService.updateSubOrderStatus(sub.storeId, sub.subOrderNumber, 'PACKED', {
      carrier: 'PATHAO',
      trackingCode: 'PTH-E2E-001',
      consignmentId: 'CNS-E2E-001',
    });
    assert.strictEqual(packed.status, 'PACKED');

    const shipped = await CheckoutService.updateSubOrderStatus(sub.storeId, sub.subOrderNumber, 'SHIPPED');
    assert.strictEqual(shipped.status, 'SHIPPED');
  });
});
