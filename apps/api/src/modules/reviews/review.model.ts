import mongoose, { Schema, Document, Types } from 'mongoose';
import { ReviewModerationStatus } from '@marketplace/types';

export interface IReviewDocument extends Document {
  productId: Types.ObjectId;
  variantId?: Types.ObjectId;
  storeId: Types.ObjectId;
  customerId: Types.ObjectId;
  customerName: string;
  subOrderId: string;
  rating: number;
  title?: string;
  comment: string;
  images: string[];
  isVerifiedPurchase: boolean;
  sentimentScore: number;
  moderationStatus: ReviewModerationStatus;
  sellerReply?: {
    comment: string;
    repliedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReviewDocument>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    variantId: {
      type: Schema.Types.ObjectId,
      ref: 'ProductVariant',
      default: null,
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    subOrderId: {
      type: String,
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      default: '',
      trim: true,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: true,
    },
    sentimentScore: {
      type: Number,
      default: 0,
      min: -1,
      max: 1,
    },
    moderationStatus: {
      type: String,
      enum: ['APPROVED', 'FLAGGED', 'REJECTED'],
      default: 'APPROVED',
      index: true,
    },
    sellerReply: {
      type: {
        comment: { type: String, required: true },
        repliedAt: { type: Date, default: Date.now },
      },
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret: any) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

reviewSchema.index({ productId: 1, moderationStatus: 1, createdAt: -1 });
reviewSchema.index({ customerId: 1, productId: 1, subOrderId: 1 }, { unique: true });

export const Review = (mongoose.models.Review as mongoose.Model<IReviewDocument>) ||
  mongoose.model<IReviewDocument>('Review', reviewSchema, 'reviews');
