import { Router } from 'express';
import { authGuard, requireRole } from '../../common/middleware/authGuard';
import { validateRequest } from '../../common/middleware/validate';
import { createReviewSchema, sellerReplyReviewSchema, moderateReviewSchema } from '@marketplace/validators';
import { ReviewService } from './review.service';

export const reviewRouter = Router();

// POST /api/v1/reviews (Customer submits verified review)
reviewRouter.post('/', authGuard, requireRole('CUSTOMER', 'ADMIN', 'SUPER_ADMIN'), validateRequest({ body: createReviewSchema }), async (req, res, next) => {
  try {
    const customerId = req.user!.userId;
    const customerName = req.user!.email ? req.user!.email.split('@')[0] : 'Verified Buyer';

    const review = await ReviewService.createReview({
      customerId,
      customerName,
      productId: req.body.productId,
      variantId: req.body.variantId,
      subOrderId: req.body.subOrderId,
      rating: req.body.rating,
      title: req.body.title,
      comment: req.body.comment,
      images: req.body.images,
    });

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: 'Verified customer review submitted successfully',
      data: review,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/reviews/products/:id/reviews or /api/v1/reviews/product/:id
reviewRouter.get(['/products/:id/reviews', '/product/:id', '/products/:id'], async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const result = await ReviewService.getProductReviews(req.params.id, page, limit);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Product reviews and rating summary retrieved',
      data: result.reviews,
      summary: result.summary,
      meta: result.meta,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/reviews/:id/seller-reply (Seller replies to review)
reviewRouter.post('/:id/seller-reply', authGuard, requireRole('SELLER'), validateRequest({ body: sellerReplyReviewSchema }), async (req, res, next) => {
  try {
    const storeId = req.user?.storeId || 'store_apex';
    const updated = await ReviewService.sellerReply(req.params.id, storeId, req.body.comment);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Seller public response posted successfully',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/admin/reviews/:id/moderate (Support Agent / Admin moderation)
reviewRouter.patch(
  '/admin/reviews/:id/moderate',
  authGuard,
  requireRole('SUPER_ADMIN', 'ADMIN', 'SUPPORT_AGENT'),
  validateRequest({ body: moderateReviewSchema }),
  async (req, res, next) => {
    try {
      const updated = await ReviewService.moderateReview(req.params.id, req.body.moderationStatus);
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: `Review moderation status updated to ${req.body.moderationStatus}`,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }
);
