import { Router } from 'express';
import { CartService } from './cart.service';
import { validateRequest } from '../../common/middleware/validate';
import { addToCartSchema, updateCartItemSchema, applyCouponSchema } from '@marketplace/validators';

export const cartRouter = Router();

// Helper to extract userId or sessionId from request
function getCartContext(req: any) {
  const userId = req.user?.userId;
  const sessionId = (req.headers['x-session-id'] as string) || req.query.sessionId as string || (req.session?.id as string);
  return { userId, sessionId };
}

// GET /api/v1/cart
cartRouter.get('/', async (req, res, next) => {
  try {
    const { userId, sessionId } = getCartContext(req);
    const cart = await CartService.getOrCreateCart(userId, sessionId || 'guest-session');
    const result = await CartService.calculateCart(cart);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Cart retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/cart/items
cartRouter.post('/items', validateRequest({ body: addToCartSchema }), async (req, res, next) => {
  try {
    const { userId, sessionId } = getCartContext(req);
    const { productId, variantId, quantity } = req.body;
    const cart = await CartService.getOrCreateCart(userId, sessionId || 'guest-session');
    const result = await CartService.addItem(cart, productId, variantId, quantity);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Item added to cart',
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/cart/items/:variantId
cartRouter.patch('/items/:variantId', validateRequest({ body: updateCartItemSchema }), async (req, res, next) => {
  try {
    const { userId, sessionId } = getCartContext(req);
    const { variantId } = req.params;
    const { quantity } = req.body;
    const cart = await CartService.getOrCreateCart(userId, sessionId || 'guest-session');
    const result = await CartService.updateItemQuantity(cart, variantId, quantity);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Cart item updated',
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/cart/items/:variantId
cartRouter.delete('/items/:variantId', async (req, res, next) => {
  try {
    const { userId, sessionId } = getCartContext(req);
    const { variantId } = req.params;
    const cart = await CartService.getOrCreateCart(userId, sessionId || 'guest-session');
    const result = await CartService.removeItem(cart, variantId);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Item removed from cart',
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/cart/apply-coupon
cartRouter.post('/apply-coupon', validateRequest({ body: applyCouponSchema }), async (req, res, next) => {
  try {
    const { userId, sessionId } = getCartContext(req);
    const { couponCode } = req.body;
    const cart = await CartService.getOrCreateCart(userId, sessionId || 'guest-session');
    const result = await CartService.applyCoupon(cart, couponCode);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Coupon applied successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/cart/remove-coupon
cartRouter.delete('/remove-coupon', async (req, res, next) => {
  try {
    const { userId, sessionId } = getCartContext(req);
    const cart = await CartService.getOrCreateCart(userId, sessionId || 'guest-session');
    const result = await CartService.removeCoupon(cart);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Coupon removed',
      data: result,
    });
  } catch (error) {
    next(error);
  }
});
