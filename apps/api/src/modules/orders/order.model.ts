import mongoose, { Schema, Document, Types } from 'mongoose';
import { OrderStatus, PaymentStatus, PaymentMethod } from '@marketplace/types';

export interface IAddressSnapshot {
  recipientName: string;
  phone: string;
  streetAddress: string;
  city: string;
  division: string;
  postalCode: string;
  deliveryNotes?: string;
}

export interface ICustomerSnapshot {
  name: string;
  email: string;
  phone: string;
}

export interface IOrderDocument extends Document {
  orderNumber: string;
  customerId: Types.ObjectId;
  customerSnapshot: ICustomerSnapshot;
  shippingAddress: IAddressSnapshot;
  billingAddress: IAddressSnapshot;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  paymentMethod: PaymentMethod;
  currency: string;
  itemsSubtotal: number;
  totalShippingFee: number;
  totalDiscount: number;
  totalTax: number;
  grandTotal: number;
  couponCode?: string | null;
  customerNotes?: string | null;
  subOrderIds: Types.ObjectId[];
  stockReservationExpiresAt?: Date;
  placedAt: Date;
  paidAt?: Date;
  cancelledAt?: Date;
  cancelReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const addressSnapshotSchema = new Schema<IAddressSnapshot>(
  {
    recipientName: { type: String, required: true },
    phone: { type: String, required: true },
    streetAddress: { type: String, required: true },
    city: { type: String, required: true },
    division: { type: String, required: true },
    postalCode: { type: String, required: true },
    deliveryNotes: { type: String, default: '' },
  },
  { _id: false }
);

const customerSnapshotSchema = new Schema<ICustomerSnapshot>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrderDocument>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    customerSnapshot: {
      type: customerSnapshotSchema,
      required: true,
    },
    shippingAddress: {
      type: addressSnapshotSchema,
      required: true,
    },
    billingAddress: {
      type: addressSnapshotSchema,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['UNPAID', 'AUTHORIZED', 'PAID', 'PARTIALLY_REFUNDED', 'REFUNDED', 'FAILED'],
      default: 'UNPAID',
      index: true,
    },
    orderStatus: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'PARTIALLY_FULFILLED', 'COMPLETED', 'CANCELLED'],
      default: 'PENDING',
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'BKASH', 'NAGAD', 'SSLCOMMERZ', 'STRIPE'],
      required: true,
    },
    currency: {
      type: String,
      default: 'BDT',
    },
    itemsSubtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    totalShippingFee: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    totalDiscount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalTax: {
      type: Number,
      default: 0,
      min: 0,
    },
    grandTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    couponCode: {
      type: String,
      default: null,
    },
    customerNotes: {
      type: String,
      default: null,
    },
    subOrderIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'SubOrder',
      },
    ],
    stockReservationExpiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 15 * 60 * 1000), // 15-minute reservation
    },
    placedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    paidAt: {
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

orderSchema.index({ customerId: 1, placedAt: -1 });

export const Order = (mongoose.models.Order as mongoose.Model<IOrderDocument>) ||
  mongoose.model<IOrderDocument>('Order', orderSchema);
