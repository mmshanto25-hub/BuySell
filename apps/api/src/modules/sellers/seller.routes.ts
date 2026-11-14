import { Router } from 'express';
import { authGuard, requireRole } from '../../common/middleware/authGuard';
import { tenantGuard } from '../../common/middleware/tenantGuard';
import { sellerKycSchema, storeUpdateSchema } from '@marketplace/validators';
import { validateRequest } from '../../common/middleware/validate';
import { Seller } from './seller.model';
import { Store } from './store.model';
import { isDatabaseConnected } from '../../common/database/connection';
import { AppError } from '../../common/errors/AppError';
import { slugify } from '@marketplace/utils';

export const sellerRouter = Router();

// ==========================================
// SELLER SELF-SERVICE ONBOARDING & STORE
// ==========================================

// POST /api/v1/sellers/kyc
sellerRouter.post('/sellers/kyc', authGuard, validateRequest({ body: sellerKycSchema }), async (req, res, next) => {
  try {
    const { businessName, tradeLicenseNumber, tinNumber, nidPassportNumber, bankAccount } = req.body;

    if (isDatabaseConnected()) {
      let seller = await Seller.findOne({ userId: req.user?.userId });
      if (seller && seller.kycStatus === 'APPROVED') {
        throw AppError.conflict('Seller business is already verified and approved');
      }

      if (!seller) {
        seller = await Seller.create({
          userId: req.user?.userId,
          businessName,
          tradeLicenseNumber,
          tinNumber,
          nidPassportNumber,
          bankAccount,
          kycStatus: 'PENDING',
        });

        // Initialize Storefront in draft mode
        await Store.create({
          sellerId: seller._id,
          storeName: businessName,
          slug: slugify(businessName) + '-' + Math.random().toString(36).substring(2, 6),
          warehouseAddress: {
            streetAddress: 'Default Address',
            city: 'Dhaka',
            division: 'Dhaka',
            postalCode: '1000',
            contactPhone: req.user?.email || '+8801700000000',
          },
          status: 'INACTIVE',
        });
      } else {
        seller.businessName = businessName;
        seller.tradeLicenseNumber = tradeLicenseNumber;
        seller.tinNumber = tinNumber;
        seller.nidPassportNumber = nidPassportNumber;
        seller.bankAccount = bankAccount;
        seller.kycStatus = 'PENDING';
        await seller.save();
      }

      return res.status(201).json({
        success: true,
        statusCode: 201,
        message: 'KYC documents submitted successfully. Awaiting platform moderation.',
        data: seller,
      });
    }

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: 'KYC documents submitted successfully. Awaiting platform moderation.',
      data: {
        userId: req.user?.userId,
        businessName,
        tradeLicenseNumber,
        kycStatus: 'PENDING',
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/sellers/me
sellerRouter.get('/sellers/me', authGuard, async (req, res, next) => {
  try {
    if (isDatabaseConnected()) {
      const seller = await Seller.findOne({ userId: req.user?.userId });
      if (!seller) throw AppError.notFound('Seller profile not found');
      const store = await Store.findOne({ sellerId: seller._id });
      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Seller dossier retrieved',
        data: { seller, store },
      });
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Seller dossier retrieved',
      data: {
        seller: {
          businessName: 'Apex Footwear Ltd.',
          kycStatus: 'APPROVED',
          commissionRateOverride: 10,
        },
        store: {
          storeName: 'Apex Footwear Official',
          slug: 'apex-footwear',
          rating: 4.8,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/stores/me
sellerRouter.patch(
  '/stores/me',
  authGuard,
  requireRole('SELLER'),
  tenantGuard,
  validateRequest({ body: storeUpdateSchema }),
  async (req, res, next) => {
    try {
      if (isDatabaseConnected()) {
        const store = await Store.findByIdAndUpdate(req.user?.storeId, req.body, { new: true });
        return res.status(200).json({
          success: true,
          statusCode: 200,
          message: 'Storefront profile updated successfully',
          data: store,
        });
      }

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Storefront profile updated successfully',
        data: { ...req.body, storeId: req.user?.storeId },
      });
    } catch (error) {
      next(error);
    }
  }
);

// ==========================================
// ADMIN SELLER VETTING & KYC GOVERNANCE
// ==========================================

// GET /api/v1/admin/sellers
sellerRouter.get('/admin/sellers', authGuard, requireRole('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    if (isDatabaseConnected()) {
      const sellers = await Seller.find().populate('userId', 'firstName lastName email').sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Seller applications retrieved',
        data: sellers,
      });
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Seller applications retrieved',
      data: [
        {
          id: 'sel_1',
          businessName: 'Apex Footwear Ltd.',
          tradeLicenseNumber: 'TRAD-DHK-2024-9981',
          kycStatus: 'APPROVED',
          commissionRateOverride: 10,
        },
        {
          id: 'sel_2',
          businessName: 'Bengal Heritage Spices',
          tradeLicenseNumber: 'TRAD-CTG-2026-0041',
          kycStatus: 'PENDING',
          commissionRateOverride: null,
        },
      ],
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/admin/sellers/:id/kyc
sellerRouter.patch(
  '/admin/sellers/:id/kyc',
  authGuard,
  requireRole('SUPER_ADMIN', 'ADMIN'),
  async (req, res, next) => {
    try {
      const { status, rejectionReason } = req.body;
      if (!['APPROVED', 'REJECTED', 'ACTION_REQUIRED'].includes(status)) {
        throw AppError.badRequest('Invalid KYC status');
      }

      if (isDatabaseConnected()) {
        const seller = await Seller.findById(req.params.id);
        if (!seller) throw AppError.notFound('Seller not found');

        seller.kycStatus = status;
        if (status === 'APPROVED') {
          seller.approvedAt = new Date();
          seller.approvedBy = req.user?.userId as any;
          // Activate store
          await Store.findOneAndUpdate({ sellerId: seller._id }, { status: 'ACTIVE' });
        } else {
          seller.rejectionReason = rejectionReason || 'Documents did not meet compliance standards';
        }

        await seller.save();

        return res.status(200).json({
          success: true,
          statusCode: 200,
          message: `Seller KYC has been ${status.toLowerCase()}`,
          data: seller,
        });
      }

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: `Seller KYC has been ${status.toLowerCase()}`,
        data: { id: req.params.id, status, rejectionReason },
      });
    } catch (error) {
      next(error);
    }
  }
);
