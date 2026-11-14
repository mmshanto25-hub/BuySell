import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInventoryDocument extends Document {
  variantId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  sku: string;
  availableStock: number;
  reservedStock: number;
  soldStock: number;
  lowStockThreshold: number;
  updatedAt: Date;
}

const inventorySchema = new Schema<IInventoryDocument>(
  {
    variantId: {
      type: Schema.Types.ObjectId,
      ref: 'ProductVariant',
      required: true,
      unique: true,
      index: true,
    },
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
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },
    availableStock: {
      type: Number,
      required: true,
      min: [0, 'Available stock cannot be negative'],
      default: 0,
    },
    reservedStock: {
      type: Number,
      required: true,
      min: [0, 'Reserved stock cannot be negative'],
      default: 0,
    },
    soldStock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
    },
  },
  {
    timestamps: true,
  }
);

inventorySchema.index({ storeId: 1, availableStock: 1 });

export const Inventory: Model<IInventoryDocument> =
  mongoose.models.Inventory || mongoose.model<IInventoryDocument>('Inventory', inventorySchema);
