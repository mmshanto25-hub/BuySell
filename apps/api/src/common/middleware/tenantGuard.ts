import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { Seller } from '../../modules/sellers/seller.model';
import { Store } from '../../modules/sellers/store.model';
import { isDatabaseConnected } from '../database/connection';

export async function tenantGuard(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return next(AppError.unauthorized());
  }

  // If user is a SELLER, resolve and bind storeId and sellerId
  if (req.user.role === 'SELLER') {
    if (isDatabaseConnected()) {
      const seller = await Seller.findOne({ userId: req.user.userId });
      if (!seller) {
        return next(AppError.forbidden('Seller business profile not found. Please complete KYC onboarding.'));
      }

      const store = await Store.findOne({ sellerId: seller._id });
      if (!store) {
        return next(AppError.forbidden('Storefront not configured for this seller account.'));
      }

      req.user.sellerId = seller._id.toString();
      req.user.storeId = store._id.toString();
    } else {
      // In-memory fallback
      req.user.sellerId = 'seller_apex';
      req.user.storeId = 'store_apex';
    }
  }

  next();
}
