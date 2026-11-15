import { Types } from 'mongoose';
import { Coupon, ICouponDocument } from '../orders/coupon.model';
import { AppError } from '../../common/errors/AppError';
import { isDatabaseConnected } from '../../common/database/connection';

// In-Memory Fallback Coupon Storage
const inMemoryCoupons: any[] = [
  {
    id: 'c1',
    code: 'PLATFORM10',
    description: '10% Platform-wide discount up to ৳500',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    maxDiscountAmount: 500,
    minOrderSubtotal: 1000,
    storeId: null,
    totalUsageLimit: 1000,
    perUserUsageLimit: 1,
    usedCount: 42,
    startsAt: new Date(Date.now() - 30 * 86400000),
    expiresAt: new Date(Date.now() + 30 * 86400000),
    isActive: true,
  },
  {
    id: 'c2',
    code: 'APEXFLAT200',
    description: '৳200 Flat discount on Apex Footwear orders over ৳2,000',
    discountType: 'FIXED',
    discountValue: 200,
    maxDiscountAmount: null,
    minOrderSubtotal: 2000,
    storeId: 'store_apex',
    totalUsageLimit: 500,
    perUserUsageLimit: 2,
    usedCount: 15,
    startsAt: new Date(Date.now() - 10 * 86400000),
    expiresAt: new Date(Date.now() + 20 * 86400000),
    isActive: true,
  },
];

export class CouponService {
  /**
   * Create a platform-wide or seller-specific coupon voucher
   */
  static async createCoupon(params: {
    code: string;
    description?: string;
    discountType: 'PERCENTAGE' | 'FIXED';
    discountValue: number;
    maxDiscountAmount?: number;
    minOrderSubtotal?: number;
    storeId?: string | null;
    totalUsageLimit?: number;
    perUserUsageLimit?: number;
    expiresAt: Date | string;
  }) {
    const cleanCode = params.code.trim().toUpperCase();

    if (isDatabaseConnected()) {
      const existing = await Coupon.findOne({ code: cleanCode });
      if (existing) {
        throw AppError.conflict(`Coupon code ${cleanCode} already exists`);
      }

      const coupon = await Coupon.create({
        code: cleanCode,
        description: params.description || '',
        discountType: params.discountType,
        discountValue: params.discountValue,
        maxDiscountAmount: params.maxDiscountAmount || null,
        minOrderSubtotal: params.minOrderSubtotal || 0,
        storeId: params.storeId ? new Types.ObjectId(params.storeId) : null,
        totalUsageLimit: params.totalUsageLimit || 1000,
        perUserUsageLimit: params.perUserUsageLimit || 1,
        usedCount: 0,
        startsAt: new Date(),
        expiresAt: new Date(params.expiresAt),
        isActive: true,
      });

      return coupon;
    }

    // In-Memory
    const existing = inMemoryCoupons.find((c) => c.code === cleanCode);
    if (existing) {
      throw AppError.conflict(`Coupon code ${cleanCode} already exists`);
    }

    const newCoupon = {
      id: 'cp_' + Date.now(),
      code: cleanCode,
      description: params.description || '',
      discountType: params.discountType,
      discountValue: params.discountValue,
      maxDiscountAmount: params.maxDiscountAmount || null,
      minOrderSubtotal: params.minOrderSubtotal || 0,
      storeId: params.storeId || null,
      totalUsageLimit: params.totalUsageLimit || 1000,
      perUserUsageLimit: params.perUserUsageLimit || 1,
      usedCount: 0,
      startsAt: new Date(),
      expiresAt: new Date(params.expiresAt),
      isActive: true,
    };
    inMemoryCoupons.unshift(newCoupon);

    return newCoupon;
  }

  /**
   * Validates coupon eligibility against cart subtotal and calculates savings
   */
  static async validateCoupon(params: {
    code: string;
    cartSubtotal: number;
    storeId?: string;
    userId?: string;
  }) {
    const cleanCode = params.code.trim().toUpperCase();
    const now = new Date();

    let coupon: any = null;

    if (isDatabaseConnected()) {
      coupon = await Coupon.findOne({ code: cleanCode });
    } else {
      coupon = inMemoryCoupons.find((c) => c.code === cleanCode);
    }

    if (!coupon) {
      throw AppError.notFound(`Coupon voucher '${cleanCode}' does not exist or has expired`);
    }

    if (!coupon.isActive) {
      throw AppError.badRequest(`Coupon voucher '${cleanCode}' is currently inactive`);
    }

    if (new Date(coupon.expiresAt).getTime() < now.getTime()) {
      throw AppError.badRequest(`Coupon voucher '${cleanCode}' expired on ${new Date(coupon.expiresAt).toDateString()}`);
    }

    if (new Date(coupon.startsAt).getTime() > now.getTime()) {
      throw AppError.badRequest(`Coupon voucher '${cleanCode}' is not active yet`);
    }

    if (coupon.usedCount >= coupon.totalUsageLimit) {
      throw AppError.badRequest(`Coupon voucher '${cleanCode}' has reached its maximum global redemption limit`);
    }

    if (params.cartSubtotal < coupon.minOrderSubtotal) {
      throw AppError.badRequest(
        `Order subtotal ৳${params.cartSubtotal} is below minimum required ৳${coupon.minOrderSubtotal} for coupon '${cleanCode}'`
      );
    }

    // Check store scope
    if (coupon.storeId && params.storeId) {
      const couponStoreStr = coupon.storeId.toString();
      if (couponStoreStr !== params.storeId) {
        throw AppError.badRequest(`Coupon '${cleanCode}' is valid only for products from the specific merchant store`);
      }
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = Math.round((params.cartSubtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      discountAmount = Math.min(coupon.discountValue, params.cartSubtotal);
    }

    return {
      isValid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
      newSubtotal: Math.max(0, params.cartSubtotal - discountAmount),
      description: coupon.description,
    };
  }

  /**
   * List active coupons
   */
  static async listCoupons(filter: { storeId?: string; isPlatformOnly?: boolean }) {
    if (isDatabaseConnected()) {
      const query: Record<string, any> = { isActive: true, expiresAt: { $gte: new Date() } };
      if (filter.isPlatformOnly) query.storeId = null;
      else if (filter.storeId) query.storeId = new Types.ObjectId(filter.storeId);

      return await Coupon.find(query).sort({ createdAt: -1 });
    }

    let list = inMemoryCoupons.filter((c) => c.isActive && new Date(c.expiresAt).getTime() >= Date.now());
    if (filter.isPlatformOnly) list = list.filter((c) => c.storeId === null);
    else if (filter.storeId) list = list.filter((c) => c.storeId === filter.storeId);

    return list;
  }
}
