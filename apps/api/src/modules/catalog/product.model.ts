import mongoose, { Schema, Document, Model } from 'mongoose';
import { ProductStatus, ModerationStatus } from '@marketplace/types';

export interface IProductDocument extends Document {
  storeId: mongoose.Types.ObjectId;
  sellerId: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  shortDescription?: string;
  description: string;
  categoryId: mongoose.Types.ObjectId;
  brandId?: mongoose.Types.ObjectId;
  images: { url: string; alt: string; isPrimary: boolean; sortOrder: number }[];
  videoUrl?: string;
  attributes: { name: string; value: string }[];
  hasVariants: boolean;
  basePrice: number;
  compareAtPrice?: number;
  costPrice?: number;
  status: ProductStatus;
  moderationStatus: ModerationStatus;
  rejectionReason?: string;
  rating: number;
  totalReviews: number;
  totalSold: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProductDocument>(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true,
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: 'Seller',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
      maxlength: [255, 'Title cannot exceed 255 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    shortDescription: { type: String, maxlength: 500 },
    description: { type: String, required: [true, 'Detailed description is required'] },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    brandId: {
      type: Schema.Types.ObjectId,
      ref: 'Brand',
      default: null,
      index: true,
    },
    images: [
      {
        url: { type: String, required: true },
        alt: { type: String, default: 'Product photo' },
        isPrimary: { type: Boolean, default: false },
        sortOrder: { type: Number, default: 0 },
      },
    ],
    videoUrl: { type: String, default: null },
    attributes: [
      {
        name: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],
    hasVariants: { type: Boolean, default: false },
    basePrice: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    compareAtPrice: { type: Number, min: 0 },
    costPrice: { type: Number, min: 0, select: false },
    status: {
      type: String,
      enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
      default: 'PUBLISHED',
      index: true,
    },
    moderationStatus: {
      type: String,
      enum: ['PENDING_REVIEW', 'APPROVED', 'REJECTED'],
      default: 'PENDING_REVIEW',
      index: true,
    },
    rejectionReason: { type: String, default: null },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    totalSold: { type: Number, default: 0 },
    tags: [{ type: String, trim: true }],
  },
  {
    timestamps: true,
  }
);

productSchema.index({ storeId: 1, status: 1, moderationStatus: 1 });
productSchema.index({ categoryId: 1, status: 1, moderationStatus: 1, basePrice: 1 });
productSchema.index({ title: 'text', description: 'text', tags: 'text' });

export const Product: Model<IProductDocument> =
  mongoose.models.Product || mongoose.model<IProductDocument>('Product', productSchema);
