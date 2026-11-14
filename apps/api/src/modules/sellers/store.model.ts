import mongoose, { Schema, Document, Model } from 'mongoose';
import { StoreStatus } from '@marketplace/types';

export interface IStoreDocument extends Document {
  sellerId: mongoose.Types.ObjectId;
  storeName: string;
  slug: string;
  logoUrl?: string;
  bannerUrl?: string;
  description?: string;
  warehouseAddress: {
    streetAddress: string;
    city: string;
    division: string;
    postalCode: string;
    contactPhone: string;
  };
  rating: number;
  totalReviews: number;
  status: StoreStatus;
  supportEmail?: string;
  supportPhone?: string;
  createdAt: Date;
  updatedAt: Date;
}

const storeSchema = new Schema<IStoreDocument>(
  {
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: 'Seller',
      required: true,
      unique: true,
      index: true,
    },
    storeName: {
      type: String,
      required: [true, 'Store name is required'],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    logoUrl: { type: String, default: null },
    bannerUrl: { type: String, default: null },
    description: { type: String, default: null, maxlength: 2000 },
    warehouseAddress: {
      streetAddress: { type: String, required: true },
      city: { type: String, required: true },
      division: { type: String, required: true },
      postalCode: { type: String, required: true },
      contactPhone: { type: String, required: true },
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'VACATION_MODE'],
      default: 'ACTIVE',
      index: true,
    },
    supportEmail: { type: String, default: null },
    supportPhone: { type: String, default: null },
  },
  {
    timestamps: true,
  }
);

storeSchema.index({ status: 1, rating: -1 });

export const Store: Model<IStoreDocument> =
  mongoose.models.Store || mongoose.model<IStoreDocument>('Store', storeSchema);
