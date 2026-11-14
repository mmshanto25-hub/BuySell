import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBrandDocument extends Document {
  name: string;
  slug: string;
  logoUrl?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const brandSchema = new Schema<IBrandDocument>(
  {
    name: {
      type: String,
      required: [true, 'Brand name is required'],
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
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Brand: Model<IBrandDocument> =
  mongoose.models.Brand || mongoose.model<IBrandDocument>('Brand', brandSchema);
