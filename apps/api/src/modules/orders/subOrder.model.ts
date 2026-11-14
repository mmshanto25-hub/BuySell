import mongoose, { Schema, Document, Types } from 'mongoose';
import { SubOrderStatus } from '@marketplace/types';

export interface IOrderItemSubdoc {
  _id?: Types.ObjectId;
  productId: Types.ObjectId;
  variantId: Types.ObjectId;
  title: string;
  sku: string;
  variantTitle: string;
  imageUrl?: string;
  unitPrice: number;
  unitCostPrice?: number;
  quantity: number;
  totalPrice: number;
  commissionRate: number; // e.g. 10 for 10%
  commissionAmount: number; // Snapshot in BDT
  returnStatus?: 'NONE' | 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'REFUNDED';
}

export interface ISubOrderDocument extends Document {
  subOrderNumber: string;
  parentOrderId: Types.ObjectId;
  parentOrderNumber: string;
  storeId: Types.ObjectId;
  sellerId: Types.ObjectId;
  status: SubOrderStatus;
  items: IOrderItemSubdoc[];
  subtotal: number;
  shippingFee: number;
  commissionAmount: number;
  sellerNetEarning: number;
  carrier?: string;
  trackingCode?: string;
  consignmentId?: string;
  shippedAt?: Date;
  deliveredAt?: Date;
  escrowReleasedAt?: Date;
  cancelledAt?: Date;
  cancelReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const orderItemSchema = new Schema<IOrderItemSubdoc>(
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
    title: {
      type: String,
      required: true,
    },
    sku: {
      type: String,
      required: true,
    },
    variantTitle: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    unitCostPrice: {
      type: Number,
      default: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    commissionRate: {
      type: Number,
      required: true,
      min: 0,
    },
    commissionAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    returnStatus: {
      type: String,
      enum: ['NONE', 'REQUESTED', 'APPROVED', 'REJECTED', 'REFUNDED'],
      default: 'NONE',
    },
  },
  { _id: true }
);

const subOrderSchema = new Schema<ISubOrderDocument>(
  {
    subOrderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    parentOrderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    parentOrderNumber: {
      type: String,
      required: true,
      index: true,
    },
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
    status: {
      type: String,
      enum: [
        'PENDING',
        'CONFIRMED',
        'PACKED',
        'SHIPPED',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'COMPLETED',
        'CANCELLED',
        'RETURNED',
      ],
      default: 'PENDING',
      index: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: [(val: any[]) => val.length > 0, 'SubOrder must contain at least one item'],
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingFee: {
      type: Number,
      required: true,
      min: 0,
      default: 60,
    },
    commissionAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    sellerNetEarning: {
      type: Number,
      required: true,
      min: 0,
    },
    carrier: {
      type: String,
      default: null,
    },
    trackingCode: {
      type: String,
      default: null,
    },
    consignmentId: {
      type: String,
      default: null,
    },
    shippedAt: {
      type: Date,
      default: null,
    },
    deliveredAt: {
      type: Date,
      default: null,
      index: true,
    },
    escrowReleasedAt: {
      type: Date,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    cancelReason: {
      type: String,
      default: null,
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

subOrderSchema.index({ storeId: 1, status: 1, createdAt: -1 });
subOrderSchema.index({ deliveredAt: 1, status: 1 });

export const SubOrder = (mongoose.models.SubOrder as mongoose.Model<ISubOrderDocument>) ||
  mongoose.model<ISubOrderDocument>('SubOrder', subOrderSchema);
