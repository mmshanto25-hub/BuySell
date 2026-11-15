import { Router } from 'express';
import { authGuard, requireRole } from '../../common/middleware/authGuard';
import { validateRequest } from '../../common/middleware/validate';
import { createCouponSchema, validateCouponSchema } from '@marketplace/validators';
import { CouponService } from './coupon.service';

export const couponRouter = Router();

// POST /api/v1/coupons/validate (Customer validates coupon during checkout)
couponRouter.post('/validate', validateRequest({ body: validateCouponSchema }), async (req, res, next) => {
  try {
    const result = await CouponService.validateCoupon({
      code: req.body.code,
      cartSubtotal: req.body.cartSubtotal,
      storeId: req.body.storeId,
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: `Coupon '${result.code}' applied successfully`,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/coupons/public (Public lists active platform coupons)
couponRouter.get('/public', async (req, res, next) => {
  try {
    const coupons = await CouponService.listCoupons({ isPlatformOnly: true });
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Active promotional vouchers retrieved',
      data: coupons,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/seller/coupons (Seller creates store coupon)
export const sellerCouponRouter = Router();

sellerCouponRouter.post(
  '/',
  authGuard,
  requireRole('SELLER'),
  validateRequest({ body: createCouponSchema }),
  async (req, res, next) => {
    try {
      const storeId = req.user?.storeId || 'store_apex';
      const coupon = await CouponService.createCoupon({
        code: req.body.code,
        description: req.body.description,
        discountType: req.body.discountType,
        discountValue: req.body.discountValue,
        maxDiscountAmount: req.body.maxDiscountAmount,
        minOrderSubtotal: req.body.minOrderSubtotal,
        storeId,
        totalUsageLimit: req.body.totalUsageLimit,
        perUserUsageLimit: req.body.perUserUsageLimit,
        expiresAt: req.body.expiresAt,
      });

      res.status(201).json({
        success: true,
        statusCode: 201,
        message: `Store discount coupon '${coupon.code}' created successfully`,
        data: coupon,
      });
    } catch (err) {
      next(err);
    }
  }
);

sellerCouponRouter.get('/', authGuard, requireRole('SELLER'), async (req, res, next) => {
  try {
    const storeId = req.user?.storeId || 'store_apex';
    const coupons = await CouponService.listCoupons({ storeId });
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Store coupons retrieved',
      data: coupons,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/admin/coupons (Admin creates platform voucher)
export const adminCouponRouter = Router();

adminCouponRouter.post(
  '/',
  authGuard,
  requireRole('SUPER_ADMIN', 'ADMIN'),
  validateRequest({ body: createCouponSchema }),
  async (req, res, next) => {
    try {
      const coupon = await CouponService.createCoupon({
        code: req.body.code,
        description: req.body.description,
        discountType: req.body.discountType,
        discountValue: req.body.discountValue,
        maxDiscountAmount: req.body.maxDiscountAmount,
        minOrderSubtotal: req.body.minOrderSubtotal,
        storeId: null, // Platform scope
        totalUsageLimit: req.body.totalUsageLimit,
        perUserUsageLimit: req.body.perUserUsageLimit,
        expiresAt: req.body.expiresAt,
      });

      res.status(201).json({
        success: true,
        statusCode: 201,
        message: `Platform promotional coupon '${coupon.code}' created successfully`,
        data: coupon,
      });
    } catch (err) {
      next(err);
    }
  }
);
