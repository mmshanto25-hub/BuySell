import mongoose, { Schema, Document, Types } from 'mongoose';
import { PaymentMethod, PaymentStatus } from '@marketplace/types';

export interface IPaymentDocument extends Document {
  parentOrderId: Types.ObjectId;
  orderNumber: string;
  gateway: PaymentMethod;
  transactionId?: string | null;
  gatewaySessionId?: string | null;
  amount: number;
  currency: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
  rawWebhookPayload?: any;
  verifiedAt?: Date | null;
  ipnSignature?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPaymentDocument>(
  {
    parentOrderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    orderNumber: {
      type: String,
      required: true,
      index: true,
    },
    gateway: {
      type: String,
      enum: ['BKASH', 'NAGAD', 'SSLCOMMERZ', 'STRIPE', 'COD'],
      required: true,
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    gatewaySessionId: {
      type: String,
      default: null,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'BDT',
    },
    status: {
      type: String,
      enum: ['PENDING', 'SUCCESS', 'FAILED', 'CANCELLED'],
      default: 'PENDING',
      index: true,
    },
    rawWebhookPayload: {
      type: Schema.Types.Mixed,
      select: false,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    ipnSignature: {
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

export const Payment = (mongoose.models.Payment as mongoose.Model<IPaymentDocument>) ||
  mongoose.model<IPaymentDocument>('Payment', paymentSchema);
