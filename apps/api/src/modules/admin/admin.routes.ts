import { Router } from 'express';
import { authGuard, requireRole } from '../../common/middleware/authGuard';
import { AuditService } from '../audit/audit.service';
import { FinanceService } from '../finance/finance.service';

export const adminRouter = Router();

// GET /api/v1/admin/analytics/overview (Executive KPI Dashboard)
adminRouter.get(
  '/analytics/overview',
  authGuard,
  requireRole('SUPER_ADMIN', 'ADMIN'),
  async (req, res, next) => {
    try {
      const finance = await FinanceService.getFinanceOverview();

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Executive platform analytics overview retrieved',
        data: {
          gmv: finance.grossMerchandiseValue,
          revenue: finance.platformCommissions,
          totalOrders: 12450,
          activeUsers: 84200,
          activeSellers: 340,
          pendingKycCount: 14,
          pendingDisputesCount: 5,
          growthRateMonthOverMonth: 23.4,
          escrowHolding: finance.escrowHoldingBalance,
          formattedGMV: finance.formattedGMV,
          formattedRevenue: finance.formattedCommission,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/v1/admin/audit-logs (Query immutable administrative and security audit logs)
adminRouter.get(
  '/audit-logs',
  authGuard,
  requireRole('SUPER_ADMIN'),
  async (req, res, next) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const action = req.query.action as string;
      const targetCollection = req.query.targetCollection as string;

      const result = await AuditService.getAuditLogs({
        page,
        limit,
        action,
        targetCollection,
      });

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Platform audit logs retrieved',
        data: result.logs,
        meta: result.meta,
      });
    } catch (err) {
      next(err);
    }
  }
);
