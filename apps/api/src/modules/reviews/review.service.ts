import { Types } from 'mongoose';
import { Review, IReviewDocument } from './review.model';
import { SubOrder } from '../orders/subOrder.model';
import { Product } from '../catalog/product.model';
import { AppError } from '../../common/errors/AppError';
import { isDatabaseConnected } from '../../common/database/connection';
import { ReviewModerationStatus } from '@marketplace/types';

// In-Memory Fallback Reviews Store
const inMemoryReviews: any[] = [];

export class ReviewService {
  /**
   * Fast NLP heuristic sentiment analyzer
   * Computes sentiment score between -1.0 (very negative) and +1.0 (very positive)
   */
  static analyzeSentiment(comment: string, rating: number): { score: number; flagged: boolean; reason?: string } {
    const text = comment.toLowerCase();

    // Check for spam or abusive language
    const spamPatterns = [/whatsapp/i, /telegram/i, /free money/i, /casino/i, /crypto/i, /http:\/\//i];
    for (const pat of spamPatterns) {
      if (pat.test(text)) {
        return { score: -1.0, flagged: true, reason: 'Suspicious external contact or spam detected' };
      }
    }

    const positiveWords = ['excellent', 'great', 'amazing', 'superb', 'awesome', 'love', 'perfect', 'good', 'fast', 'premium', 'authentic', 'quality'];
    const negativeWords = ['fake', 'damaged', 'worst', 'terrible', 'broken', 'horrible', 'waste', 'bad', 'poor', 'defective', 'scam', 'cheat'];

    let posCount = 0;
    let negCount = 0;

    for (const w of positiveWords) {
      if (text.includes(w)) posCount++;
    }
    for (const w of negativeWords) {
      if (text.includes(w)) negCount++;
    }

    // Blend star rating (1-5 normalized to -1 to +1) with keyword sentiment
    const ratingSentiment = (rating - 3) / 2; // 1 -> -1.0, 3 -> 0, 5 -> +1.0
    const textSentiment = posCount + negCount > 0 ? (posCount - negCount) / (posCount + negCount) : 0;

    const blendedScore = Math.round((ratingSentiment * 0.6 + textSentiment * 0.4) * 100) / 100;
    const clampedScore = Math.max(-1, Math.min(1, blendedScore));

    const flagged = clampedScore < -0.6 && negCount >= 2;
    return {
      score: clampedScore,
      flagged,
      reason: flagged ? 'High severity negative review flagged for customer support review' : undefined,
    };
  }

  /**
   * Submit a verified customer review
   */
  static async createReview(params: {
    customerId: string;
    customerName: string;
    productId: string;
    variantId?: string;
    subOrderId: string;
    rating: number;
    title?: string;
    comment: string;
    images?: string[];
  }) {
    const { customerId, customerName, productId, variantId, subOrderId, rating, title, comment, images } = params;

    // 1. Analyze sentiment and check moderation flags
    const sentiment = this.analyzeSentiment(comment, rating);
    const moderationStatus: ReviewModerationStatus = sentiment.flagged ? 'FLAGGED' : 'APPROVED';

    if (isDatabaseConnected()) {
      // 2. Verified purchase validation
      const subOrder = await SubOrder.findOne({
        $or: [{ subOrderNumber: subOrderId }, { _id: Types.ObjectId.isValid(subOrderId) ? new Types.ObjectId(subOrderId) : null }],
      });

      if (!subOrder) {
        throw AppError.badRequest(`Order ${subOrderId} not found. Reviews can only be submitted for verified orders.`);
      }

      if (subOrder.status !== 'DELIVERED') {
        throw AppError.badRequest(`Cannot review product before order delivery. Current sub-order status: ${subOrder.status}`);
      }

      const existing = await Review.findOne({
        customerId: new Types.ObjectId(customerId),
        productId: new Types.ObjectId(productId),
        subOrderId: subOrder.subOrderNumber,
      });

      if (existing) {
        throw AppError.conflict('You have already submitted a review for this product on this order');
      }

      const review = await Review.create({
        productId: new Types.ObjectId(productId),
        variantId: variantId ? new Types.ObjectId(variantId) : null,
        storeId: subOrder.storeId,
        customerId: new Types.ObjectId(customerId),
        customerName,
        subOrderId: subOrder.subOrderNumber,
        rating,
        title: title || '',
        comment,
        images: images || [],
        isVerifiedPurchase: true,
        sentimentScore: sentiment.score,
        moderationStatus,
      });

      // 3. Recalculate Product average rating
      await this.recalculateProductRating(productId);

      return review;
    }

    // In-Memory Fallback
    const existing = inMemoryReviews.find(
      (r) => r.customerId === customerId && r.productId === productId && r.subOrderId === subOrderId
    );
    if (existing) {
      throw AppError.conflict('You have already submitted a review for this product on this order');
    }

    const newReview = {
      id: 'rev_' + Date.now(),
      productId,
      variantId,
      storeId: 'store_apex',
      customerId,
      customerName,
      subOrderId,
      rating,
      title: title || '',
      comment,
      images: images || [],
      isVerifiedPurchase: true,
      sentimentScore: sentiment.score,
      moderationStatus,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    inMemoryReviews.unshift(newReview);

    return newReview;
  }

  /**
   * Recalculates product rating and review count
   */
  private static async recalculateProductRating(productId: string) {
    if (!isDatabaseConnected()) return;

    const stats = await Review.aggregate([
      { $match: { productId: new Types.ObjectId(productId), moderationStatus: 'APPROVED' } },
      {
        $group: {
          _id: '$productId',
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      await Product.findByIdAndUpdate(productId, {
        rating: Math.round(stats[0].avgRating * 10) / 10,
        totalReviews: stats[0].totalReviews,
      });
    }
  }

  /**
   * Retrieve reviews for a product with rating breakdown
   */
  static async getProductReviews(productId: string, page = 1, limit = 10) {
    if (isDatabaseConnected()) {
      const filter = { productId: new Types.ObjectId(productId), moderationStatus: 'APPROVED' };
      const totalItems = await Review.countDocuments(filter);
      const reviews = await Review.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const allApproved = await Review.find(filter);
      const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      let sumRating = 0;

      for (const r of allApproved) {
        sumRating += r.rating;
        const star = Math.min(5, Math.max(1, r.rating)) as 1 | 2 | 3 | 4 | 5;
        starCounts[star]++;
      }

      const avgRating = allApproved.length > 0 ? Math.round((sumRating / allApproved.length) * 10) / 10 : 0;

      return {
        reviews,
        summary: {
          averageRating: avgRating,
          totalReviews: allApproved.length,
          starBreakdown: starCounts,
          verifiedPurchasePercentage: allApproved.length > 0 ? 100 : 0,
        },
        meta: {
          page,
          limit,
          totalItems,
          totalPages: Math.ceil(totalItems / limit),
          hasNextPage: page * limit < totalItems,
          hasPrevPage: page > 1,
        },
      };
    }

    // In-Memory
    const reviews = inMemoryReviews.filter((r) => r.productId === productId && r.moderationStatus === 'APPROVED');
    const totalItems = reviews.length;
    const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sumRating = 0;
    for (const r of reviews) {
      sumRating += r.rating;
      const star = Math.min(5, Math.max(1, r.rating)) as 1 | 2 | 3 | 4 | 5;
      starCounts[star]++;
    }
    const avgRating = reviews.length > 0 ? Math.round((sumRating / reviews.length) * 10) / 10 : 4.8;

    return {
      reviews: reviews.slice((page - 1) * limit, page * limit),
      summary: {
        averageRating: avgRating,
        totalReviews: totalItems,
        starBreakdown: starCounts,
        verifiedPurchasePercentage: 100,
      },
      meta: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit) || 1,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  }

  /**
   * Seller posts a public response to a customer review
   */
  static async sellerReply(reviewId: string, storeId: string, comment: string) {
    if (isDatabaseConnected()) {
      const review = await Review.findById(reviewId);
      if (!review) throw AppError.notFound(`Review ${reviewId} not found`);

      if (review.storeId.toString() !== storeId) {
        throw AppError.forbidden('Unauthorized: You can only reply to reviews for your own store products');
      }

      review.sellerReply = {
        comment,
        repliedAt: new Date(),
      };
      await review.save();
      return review;
    }

    // In-Memory
    const review = inMemoryReviews.find((r) => r.id === reviewId);
    if (!review) throw AppError.notFound(`Review ${reviewId} not found`);
    review.sellerReply = {
      comment,
      repliedAt: new Date(),
    };
    return review;
  }

  /**
   * Support Agent / Admin moderates a review
   */
  static async moderateReview(reviewId: string, moderationStatus: ReviewModerationStatus) {
    if (isDatabaseConnected()) {
      const review = await Review.findById(reviewId);
      if (!review) throw AppError.notFound(`Review ${reviewId} not found`);

      review.moderationStatus = moderationStatus;
      await review.save();
      await this.recalculateProductRating(review.productId.toString());
      return review;
    }

    const review = inMemoryReviews.find((r) => r.id === reviewId);
    if (!review) throw AppError.notFound(`Review ${reviewId} not found`);
    review.moderationStatus = moderationStatus;
    return review;
  }
}
