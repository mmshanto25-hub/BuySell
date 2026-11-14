import { Router } from 'express';
import { authGuard } from '../../common/middleware/authGuard';
import { validateRequest } from '../../common/middleware/validate';
import { initiatePaymentSchema } from '@marketplace/validators';
import { PaymentService } from './payment.service';

export const paymentRouter = Router();

// POST /api/v1/payments/initiate
paymentRouter.post(
  '/initiate',
  authGuard,
  validateRequest({ body: initiatePaymentSchema }),
  async (req, res, next) => {
    try {
      const { orderNumber, gateway } = req.body;
      const result = await PaymentService.initiatePayment(orderNumber, gateway);

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Payment session created successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/v1/payments/:orderNumber/status
paymentRouter.get('/:orderNumber/status', authGuard, async (req, res, next) => {
  try {
    const { orderNumber } = req.params;
    const status = await PaymentService.getPaymentStatus(orderNumber);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Payment verification status retrieved',
      data: status,
    });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// INBOUND WEBHOOK INGESTION (Signed / Public)
// ==========================================

export const webhookRouter = Router();

// POST /api/v1/webhooks/bkash
webhookRouter.post('/bkash', async (req, res, next) => {
  try {
    const { orderNumber, paymentID, trxID, amount } = req.body;
    const signature = req.headers['x-bkash-signature'] as string;

    const result = await PaymentService.handleWebhook(
      'BKASH',
      {
        orderNumber,
        transactionId: trxID || paymentID,
        amount,
      },
      signature
    );

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

// POST /api/v1/webhooks/sslcommerz
webhookRouter.post('/sslcommerz', async (req, res, next) => {
  try {
    const { tran_id, val_id, amount, status } = req.body;
    // SSLCommerz provides tran_id as orderNumber
    const result = await PaymentService.handleWebhook('SSLCOMMERZ', {
      orderNumber: tran_id,
      transactionId: val_id,
      amount: parseFloat(amount),
      status,
    });

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

// POST /api/v1/webhooks/stripe
webhookRouter.post('/stripe', async (req, res, next) => {
  try {
    const { orderNumber, id, payment_intent } = req.body;
    const sig = req.headers['stripe-signature'] as string;

    const result = await PaymentService.handleWebhook(
      'STRIPE',
      {
        orderNumber,
        transactionId: payment_intent || id,
      },
      sig
    );

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
