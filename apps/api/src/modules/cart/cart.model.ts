import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICartItemSubdoc {
  productId: Types.ObjectId;
  variantId: Types.ObjectId;
  storeId: Types.ObjectId;
  sku: string;
  quantity: number;
  addedAt: Date;
}

export interface ICartDocument extends Document {
  userId?: Types.ObjectId | null;
  sessionId?: string | null;
  items: ICartItemSubdoc[];
  couponCode?: string | null;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const cartItemSchema = new Schema<ICartItemSubdoc>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    variantId: {
      type: Schema.Types.ObjectId,
      ref: 'ProductVariant',
      required: true,
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
    },
    sku: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const cartSchema = new Schema<ICartDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    sessionId: {
      type: String,
      default: null,
      index: true,
    },
    items: {
      type: [cartItemSchema],
      default: [],
    },
    couponCode: {
      type: String,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      index: { expires: 0 },
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

cartSchema.index({ userId: 1, updatedAt: -1 });

export const Cart = (mongoose.models.Cart as mongoose.Model<ICartDocument>) ||
  mongoose.model<ICartDocument>('Cart', cartSchema);
