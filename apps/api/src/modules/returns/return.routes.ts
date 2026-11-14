import { Router } from 'express';
import { authGuard, requireRole } from '../../common/middleware/authGuard';
import { tenantGuard } from '../../common/middleware/tenantGuard';
import { validateRequest } from '../../common/middleware/validate';
import {
  createReturnSchema,
  sellerRespondReturnSchema,
  arbitrateDisputeSchema,
} from '@marketplace/validators';
import { ReturnService } from './return.service';

export const returnRouter = Router();

// POST /api/v1/returns (Customer initiates return)
returnRouter.post(
  '/',
  authGuard,
  validateRequest({ body: createReturnSchema }),
  async (req, res, next) => {
    try {
      const customerId = req.user!.userId;
      const result = await ReturnService.createReturnRequest(customerId, req.body);

      res.status(201).json({
        success: true,
        statusCode: 201,
        message: 'Return request submitted successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/v1/returns (Filtered by user role)
returnRouter.get('/', authGuard, async (req, res, next) => {
  try {
    const role = req.user?.role;
    let filters: any = {};

    if (role === 'CUSTOMER') {
      filters.customerId = req.user?.userId;
    } else if (role === 'SELLER') {
      filters.storeId = req.user?.storeId || (req as any).storeId;
    }

    if (req.query.status) {
      filters.status = req.query.status as string;
    }

    const returns = await ReturnService.getReturns(filters);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Return requests retrieved successfully',
      data: returns,
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/returns/:id/seller-respond
returnRouter.patch(
  '/:id/seller-respond',
  authGuard,
  requireRole('SELLER'),
  tenantGuard,
  validateRequest({ body: sellerRespondReturnSchema }),
  async (req, res, next) => {
    try {
      const storeId = req.user?.storeId || (req as any).storeId || 'store_apex';
      const { id } = req.params;
      const { action, contestReason } = req.body;

      const updated = await ReturnService.sellerRespond(storeId, id, action, contestReason);

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: `Return request ${action === 'ACCEPT' ? 'accepted' : 'contested'} by seller`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /api/v1/returns/:id/receive (Seller confirms return package received & inspected)
returnRouter.patch(
  '/:id/receive',
  authGuard,
  requireRole('SELLER'),
  tenantGuard,
  async (req, res, next) => {
    try {
      const storeId = req.user?.storeId || (req as any).storeId || 'store_apex';
      const { id } = req.params;

      const result = await ReturnService.confirmInspectionAndRefund(storeId, id);

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

// ==========================================
// DISPUTE ARBITRATION ROUTER
// ==========================================

export const disputeRouter = Router();

// POST /api/v1/disputes/:returnId/arbitrate (Admin / Support resolution)
disputeRouter.post(
  '/:returnId/arbitrate',
  authGuard,
  requireRole('ADMIN', 'SUPER_ADMIN', 'SUPPORT_AGENT'),
  validateRequest({ body: arbitrateDisputeSchema }),
  async (req, res, next) => {
    try {
      const adminUserId = req.user!.userId;
      const { returnId } = req.params;
      const { resolution, adminNotes, refundAmount } = req.body;

      const result = await ReturnService.arbitrateDispute(
        adminUserId,
        returnId,
        resolution,
        adminNotes,
        refundAmount
      );

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: `Dispute arbitrated: ${resolution}`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);
