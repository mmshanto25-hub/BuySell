import { Router } from 'express';
import { authGuard, requireRole } from '../../common/middleware/authGuard';
import { tenantGuard } from '../../common/middleware/tenantGuard';
import { validateRequest } from '../../common/middleware/validate';
import { createConsignmentSchema, carrierWebhookSchema } from '@marketplace/validators';
import { LogisticsService } from './logistics.service';

export const logisticsRouter = Router();

// POST /api/v1/logistics/consignments (Seller books carrier consignment)
logisticsRouter.post(
  '/consignments',
  authGuard,
  requireRole('SELLER'),
  tenantGuard,
  validateRequest({ body: createConsignmentSchema }),
  async (req, res, next) => {
    try {
      const storeId = req.user?.storeId || (req as any).storeId;
      const result = await LogisticsService.createConsignment(storeId, req.body);

      res.status(201).json({
        success: true,
        statusCode: 201,
        message: 'Consignment booked successfully. Shipping label PDF generated.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/v1/logistics/track/:trackingCode (Public Tracking)
logisticsRouter.get('/track/:trackingCode', async (req, res, next) => {
  try {
    const { trackingCode } = req.params;
    const result = await LogisticsService.trackConsignment(trackingCode);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Package tracking history retrieved',
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// COURIER WEBHOOK CALLBACKS
// ==========================================

export const courierWebhookRouter = Router();

// POST /api/v1/webhooks/logistics/pathao
courierWebhookRouter.post('/pathao', validateRequest({ body: carrierWebhookSchema }), async (req, res, next) => {
  try {
    const result = await LogisticsService.handleCarrierWebhook('PATHAO', req.body);
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: result.message,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/webhooks/logistics/steadfast
courierWebhookRouter.post('/steadfast', validateRequest({ body: carrierWebhookSchema }), async (req, res, next) => {
  try {
    const result = await LogisticsService.handleCarrierWebhook('STEADFAST', req.body);
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: result.message,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});
