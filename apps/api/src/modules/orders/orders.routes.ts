import { Router } from 'express';
import { authGuard, requireRole } from '../../common/middleware/authGuard';
import { tenantGuard } from '../../common/middleware/tenantGuard';
import { validateRequest } from '../../common/middleware/validate';
import { placeOrderSchema, preValidateCheckoutSchema, updateSubOrderStatusSchema } from '@marketplace/validators';
import { CheckoutService } from './checkout.service';
import { Order } from './order.model';
import { SubOrder } from './subOrder.model';
import { isDatabaseConnected } from '../../common/database/connection';

export const ordersRouter = Router();

// ==========================================
// 1. CHECKOUT ENDPOINTS
// ==========================================

// POST /api/v1/orders/checkout/pre-validate (or mounted under /api/v1/checkout)
ordersRouter.post(
  '/pre-validate',
  authGuard,
  validateRequest({ body: preValidateCheckoutSchema }),
  async (req, res, next) => {
    try {
      const userId = req.user!.userId;
      const result = await CheckoutService.preValidate(userId, req.body);

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Pre-checkout pricing validated successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/v1/orders/checkout/place-order
ordersRouter.post(
  '/place-order',
  authGuard,
  validateRequest({ body: placeOrderSchema }),
  async (req, res, next) => {
    try {
      const userId = req.user!.userId;
      const userSnapshot = {
        name: req.user?.email ? req.user.email.split('@')[0] : 'Valued Customer',
        email: req.user?.email || 'customer@example.com',
        phone: '+8801700000000',
      };

      const result = await CheckoutService.placeOrder(userId, userSnapshot, req.body);

      res.status(201).json({
        success: true,
        statusCode: 201,
        message: 'Order created successfully. Stock reserved for 15 minutes.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

// ==========================================
// 2. CUSTOMER ORDER PORTAL
// ==========================================

// GET /api/v1/orders (Customer Order History)
ordersRouter.get('/', authGuard, async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const orders = await CheckoutService.getCustomerOrders(userId);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Customer order history retrieved',
      data: orders,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/orders/:orderNumber (Unified Parent Order Detail)
ordersRouter.get('/:orderNumber', authGuard, async (req, res, next) => {
  try {
    const { orderNumber } = req.params;
    const userId = req.user?.role === 'ADMIN' || req.user?.role === 'SUPER_ADMIN' ? undefined : req.user!.userId;
    const order = await CheckoutService.getOrderByNumber(orderNumber, userId);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Order details retrieved successfully',
      data: order,
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/orders/:orderNumber/cancel (Customer Order Cancellation)
ordersRouter.patch('/:orderNumber/cancel', authGuard, async (req, res, next) => {
  try {
    const { orderNumber } = req.params;
    const { reason } = req.body;
    const result = await CheckoutService.cancelOrder(req.user!.userId, orderNumber, reason);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Order cancelled successfully and reserved stock released',
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 3. SELLER FULFILLMENT QUEUE
// ==========================================

// GET /api/v1/orders/seller/sub-orders (Seller's Sub-Orders)
ordersRouter.get(
  '/seller/sub-orders',
  authGuard,
  requireRole('SELLER'),
  tenantGuard,
  async (req, res, next) => {
    try {
      const storeId = req.user?.storeId || (req as any).storeId || 'store_apex';
      const status = req.query.status as string;
      const subOrders = await CheckoutService.getSellerSubOrders(storeId, status);

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Seller sub-orders retrieved successfully',
        data: subOrders,
      });
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /api/v1/orders/seller/sub-orders/:subOrderNumber/status (Status Transitions)
ordersRouter.patch(
  '/seller/sub-orders/:subOrderNumber/status',
  authGuard,
  requireRole('SELLER'),
  tenantGuard,
  validateRequest({ body: updateSubOrderStatusSchema }),
  async (req, res, next) => {
    try {
      const storeId = req.user?.storeId || (req as any).storeId || 'store_apex';
      const { subOrderNumber } = req.params;
      const { status, carrier, trackingCode, consignmentId } = req.body;

      const updated = await CheckoutService.updateSubOrderStatus(
        storeId,
        subOrderNumber,
        status,
        { carrier, trackingCode, consignmentId }
      );

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: `Sub-order transitioned to ${status}`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
);

// ==========================================
// 4. ADMIN GLOBAL MONITOR
// ==========================================

// GET /api/v1/orders/admin/all (Admin Order Overview)
ordersRouter.get(
  '/admin/all',
  authGuard,
  requireRole('ADMIN', 'SUPER_ADMIN', 'ORDER_MANAGER'),
  async (req, res, next) => {
    try {
      if (isDatabaseConnected()) {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const total = await Order.countDocuments();
        const orders = await Order.find()
          .populate('subOrderIds')
          .sort({ placedAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit);

        return res.status(200).json({
          success: true,
          statusCode: 200,
          message: 'Admin orders list retrieved',
          data: {
            orders,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
          },
        });
      }

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Admin orders list retrieved',
        data: {
          orders: await CheckoutService.getCustomerOrders('admin_view'),
          pagination: { page: 1, limit: 20, total: 2, totalPages: 1 },
        },
      });
    } catch (error) {
      next(error);
    }
  }
);
