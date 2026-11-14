import { Router } from 'express';
import { authGuard, requireRole } from '../../common/middleware/authGuard';
import { formatCurrency } from '@marketplace/utils';

export const financeRouter = Router();

// GET /api/v1/finance/overview (For Admin & Finance Managers)
financeRouter.get('/overview', authGuard, requireRole('SUPER_ADMIN', 'FINANCE_MANAGER'), (req, res) => {
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Financial summary retrieved',
    data: {
      grossMerchandiseValue: 1450000,
      platformCommissions: 174000,
      escrowHoldingBalance: 320000,
      clearedSellerPayable: 956000,
      formattedGMV: formatCurrency(1450000),
      formattedCommission: formatCurrency(174000),
    },
  });
});
