import { Schema, model, Document, Types } from 'mongoose';
import { SettlementStatus } from '@marketplace/types';

export interface ISellerWalletDocument extends Document {
  sellerId: Types.ObjectId;
  storeId: Types.ObjectId;
  pendingEscrowBalance: number;
  availableBalance: number;
  processingBalance: number;
  lifetimeEarnings: number;
  lastReconciledAt: Date;
  updatedAt: Date;
}

const sellerWalletSchema = new Schema<ISellerWalletDocument>(
  {
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: 'Seller',
      required: true,
      unique: true,
      index: true,
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true,
    },
    pendingEscrowBalance: {
      type: Number,
      default: 0,
      min: [0, 'Pending escrow balance cannot be negative'],
    },
    availableBalance: {
      type: Number,
      default: 0,
      min: [0, 'Available balance cannot be negative'],
    },
    processingBalance: {
      type: Number,
      default: 0,
      min: [0, 'Processing balance cannot be negative'],
    },
    lifetimeEarnings: {
      type: Number,
      default: 0,
      min: [0, 'Lifetime earnings cannot be negative'],
    },
    lastReconciledAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret: any) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const SellerWallet = model<ISellerWalletDocument>('SellerWallet', sellerWalletSchema, 'sellerWallets');

export interface ISettlementDocument extends Document {
  settlementNumber: string;
  sellerId: Types.ObjectId;
  storeId: Types.ObjectId;
  amountRequested: number;
  payoutMethod: 'BANK_TRANSFER' | 'BKASH' | 'NAGAD';
  destinationDetails: Record<string, any>;
  status: SettlementStatus;
  bankTransactionRef?: string;
  requestedAt: Date;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  disbursedAt?: Date;
  rejectionReason?: string;
}

const settlementSchema = new Schema<ISettlementDocument>(
  {
    settlementNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: 'Seller',
      required: true,
      index: true,
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true,
    },
    amountRequested: {
      type: Number,
      required: true,
      min: [1000, 'Minimum settlement payout is ৳1,000'],
    },
    payoutMethod: {
      type: String,
      required: true,
      enum: ['BANK_TRANSFER', 'BKASH', 'NAGAD'],
    },
    destinationDetails: {
      type: Schema.Types.Mixed,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['REQUESTED', 'UNDER_REVIEW', 'APPROVED', 'DISBURSED', 'REJECTED'],
      default: 'REQUESTED',
      index: true,
    },
    bankTransactionRef: {
      type: String,
      default: null,
      trim: true,
    },
    requestedAt: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    disbursedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: null,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret: any) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

settlementSchema.index({ sellerId: 1, status: 1 });
settlementSchema.index({ requestedAt: -1 });

export const Settlement = model<ISettlementDocument>('Settlement', settlementSchema, 'settlements');
