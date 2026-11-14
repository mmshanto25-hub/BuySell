import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProductVariantDocument extends Document {
  productId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  sku: string;
  barcode?: string;
  title: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  attributes: { name: string; value: string }[];
  imageUrl?: string;
  weightInGrams: number;
  dimensions?: { length: number; width: number; height: number };
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

const productVariantSchema = new Schema<IProductVariantDocument>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true,
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    barcode: { type: String, trim: true },
    title: {
      type: String,
      required: [true, 'Variant title is required (e.g. Black / XL)'],
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    compareAtPrice: { type: Number, min: 0 },
    costPrice: { type: Number, min: 0, select: false },
    attributes: [
      {
        name: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],
    imageUrl: { type: String, default: null },
    weightInGrams: {
      type: Number,
      default: 200,
      min: 0,
    },
    dimensions: {
      length: { type: Number, default: 0 },
      width: { type: Number, default: 0 },
      height: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const ProductVariant: Model<IProductVariantDocument> =
  mongoose.models.ProductVariant || mongoose.model<IProductVariantDocument>('ProductVariant', productVariantSchema);
