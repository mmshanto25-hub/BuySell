import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICouponDocument extends Document {
  code: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  maxDiscountAmount?: number;
  minOrderSubtotal: number;
  storeId?: Types.ObjectId | null;
  totalUsageLimit: number;
  perUserUsageLimit: number;
  usedCount: number;
  startsAt: Date;
  expiresAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = new Schema<ICouponDocument>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    discountType: {
      type: String,
      enum: ['PERCENTAGE', 'FIXED'],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    maxDiscountAmount: {
      type: Number,
      default: null,
    },
    minOrderSubtotal: {
      type: Number,
      default: 0,
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      default: null,
      index: true,
    },
    totalUsageLimit: {
      type: Number,
      default: 1000,
    },
    perUserUsageLimit: {
      type: Number,
      default: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    startsAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret: any) => {
        ret.id = ret._id?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

couponSchema.index({ code: 1, isActive: 1, expiresAt: 1 });

export const Coupon = (mongoose.models.Coupon as mongoose.Model<ICouponDocument>) ||
  mongoose.model<ICouponDocument>('Coupon', couponSchema);
