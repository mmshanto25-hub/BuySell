import { Router } from 'express';
import { authGuard } from '../../common/middleware/authGuard';
import { generateOrderNumber, generateSubOrderNumber } from '@marketplace/utils';

export const ordersRouter = Router();

// POST /api/v1/orders/checkout-simulation
ordersRouter.post('/checkout-simulation', authGuard, (req, res) => {
  const parentOrderNumber = generateOrderNumber();
  const subOrder1 = generateSubOrderNumber(parentOrderNumber, 0);
  const subOrder2 = generateSubOrderNumber(parentOrderNumber, 1);

  res.status(201).json({
    success: true,
    statusCode: 201,
    message: 'Multi-vendor split order generated successfully',
    data: {
      parentOrder: {
        orderNumber: parentOrderNumber,
        customerId: req.user?.userId,
        itemsSubtotal: 11300,
        totalShippingFee: 120,
        grandTotal: 11420,
        paymentStatus: 'UNPAID',
        orderStatus: 'PENDING',
        subOrders: [
          {
            subOrderNumber: subOrder1,
            storeName: 'Apex Footwear',
            subtotal: 4500,
            shippingFee: 60,
            commissionAmount: 540,
            status: 'PENDING',
          },
          {
            subOrderNumber: subOrder2,
            storeName: 'Aarong Artisan Crafts',
            subtotal: 6800,
            shippingFee: 60,
            commissionAmount: 1020,
            status: 'PENDING',
          },
        ],
      },
    },
  });
});
