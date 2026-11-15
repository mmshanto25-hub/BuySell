import { Router } from 'express';
import { authGuard, requireRole } from '../../common/middleware/authGuard';
import { validateRequest } from '../../common/middleware/validate';
import { requestSettlementSchema } from '@marketplace/validators';
import { FinanceService } from './finance.service';
import { LedgerEntry } from './ledgerEntry.model';
import { isDatabaseConnected } from '../../common/database/connection';
import { z } from 'zod';

export const financeRouter = Router();

const reviewSettlementSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT']),
  bankTransactionRef: z.string().optional(),
  rejectionReason: z.string().optional(),
});

// ==========================================
// 1. EXECUTIVE FINANCE & LEDGER OVERVIEW
// ==========================================

// GET /api/v1/finance/overview (Admin, Finance Manager)
financeRouter.get(
  '/overview',
  authGuard,
  requireRole('SUPER_ADMIN', 'ADMIN', 'FINANCE_MANAGER'),
  async (req, res, next) => {
    try {
      const overview = await FinanceService.getFinanceOverview();
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Financial summary retrieved successfully',
        data: overview,
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/v1/finance/reconciliation (Super Admin, Finance Manager)
financeRouter.get(
  '/reconciliation',
  authGuard,
  requireRole('SUPER_ADMIN', 'FINANCE_MANAGER'),
  async (req, res, next) => {
    try {
      const report = await FinanceService.getReconciliationReport();
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Double-entry ledger reconciliation report generated',
        data: report,
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/v1/finance/ledger (Super Admin, Finance Manager)
financeRouter.get(
  '/ledger',
  authGuard,
  requireRole('SUPER_ADMIN', 'FINANCE_MANAGER'),
  async (req, res, next) => {
    try {
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
      const accountCode = req.query.accountCode as string;

      if (isDatabaseConnected()) {
        const filter: Record<string, any> = {};
        if (accountCode) filter.accountCode = accountCode;

        const totalItems = await LedgerEntry.countDocuments(filter);
        const entries = await LedgerEntry.find(filter)
          .sort({ postedAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit);

        return res.status(200).json({
          success: true,
          statusCode: 200,
          message: 'Ledger journal entries retrieved',
          data: entries,
          meta: {
            page,
            limit,
            totalItems,
            totalPages: Math.ceil(totalItems / limit),
            hasNextPage: page * limit < totalItems,
            hasPrevPage: page > 1,
          },
        });
      }

      // In-Memory
      const report = await FinanceService.getReconciliationReport();
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Ledger journal entries retrieved',
        data: [],
        meta: { page: 1, limit, totalItems: 0, totalPages: 1, hasNextPage: false, hasPrevPage: false },
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/v1/finance/escrow-releases/run (Automated Escrow Release Worker)
financeRouter.post(
  '/escrow-releases/run',
  authGuard,
  requireRole('SUPER_ADMIN', 'FINANCE_MANAGER'),
  async (req, res, next) => {
    try {
      const result = await FinanceService.processAutomatedEscrowReleases();
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Automated 7-day post-delivery escrow releases executed',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
);

// ==========================================
// 2. SELLER WALLET & SETTLEMENTS
// ==========================================

export const sellerFinanceRouter = Router();

// GET /api/v1/seller/wallet (Seller)
sellerFinanceRouter.get('/wallet', authGuard, requireRole('SELLER'), async (req, res, next) => {
  try {
    const sellerId = req.user?.sellerId || req.user?.userId || 'seller_apex';
    const result = await FinanceService.getSellerWallet(sellerId);
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Seller wallet and financial balance statement retrieved',
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/seller/settlements (Seller withdrawal request)
sellerFinanceRouter.post(
  '/settlements',
  authGuard,
  requireRole('SELLER'),
  validateRequest({ body: requestSettlementSchema }),
  async (req, res, next) => {
    try {
      const sellerId = req.user?.sellerId || req.user?.userId || 'seller_apex';
      const storeId = req.user?.storeId || 'store_apex';

      const settlement = await FinanceService.requestSettlement({
        sellerId,
        storeId,
        amount: req.body.amount,
        payoutMethod: req.body.payoutMethod,
        destinationDetails: req.body.destinationDetails || {
          accountName: 'Official Merchant Account',
          bankName: 'BRAC Bank',
          accountNumber: '****4910',
        },
      });

      res.status(201).json({
        success: true,
        statusCode: 201,
        message: 'Settlement payout request submitted for finance review',
        data: settlement,
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/v1/seller/settlements (Seller list own settlements)
sellerFinanceRouter.get('/settlements', authGuard, requireRole('SELLER'), async (req, res, next) => {
  try {
    const sellerId = req.user?.sellerId || req.user?.userId || 'seller_apex';
    const settlements = await FinanceService.listSettlements({ sellerId });
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Settlement requests history retrieved',
      data: settlements,
    });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 3. ADMIN SETTLEMENT AUTHORIZATION
// ==========================================

export const adminSettlementRouter = Router();

// GET /api/v1/admin/finance/settlements (Finance Manager, Admin)
adminSettlementRouter.get(
  '/settlements',
  authGuard,
  requireRole('SUPER_ADMIN', 'ADMIN', 'FINANCE_MANAGER'),
  async (req, res, next) => {
    try {
      const status = req.query.status as any;
      const settlements = await FinanceService.listSettlements({ status });
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Merchant settlement authorization queue retrieved',
        data: settlements,
      });
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /api/v1/admin/finance/settlements/:id/review (Approve or Reject Payout)
adminSettlementRouter.patch(
  '/settlements/:id/review',
  authGuard,
  requireRole('SUPER_ADMIN', 'FINANCE_MANAGER'),
  validateRequest({ body: reviewSettlementSchema }),
  async (req, res, next) => {
    try {
      const financeManagerId = req.user?.userId || 'admin_finance_1';
      const settlement = await FinanceService.reviewSettlement({
        settlementId: req.params.id,
        action: req.body.action,
        financeManagerId,
        bankTransactionRef: req.body.bankTransactionRef,
        rejectionReason: req.body.rejectionReason,
      });

      res.status(200).json({
        success: true,
        statusCode: 200,
        message:
          req.body.action === 'APPROVE'
            ? 'Settlement authorized and disbursed to vendor bank'
            : 'Settlement request rejected and funds unlocked to available balance',
        data: settlement,
      });
    } catch (err) {
      next(err);
    }
  }
);
