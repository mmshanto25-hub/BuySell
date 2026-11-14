import mongoose, { Schema, Document, Model } from 'mongoose';
import { KYCStatus } from '@marketplace/types';

export interface ISellerDocument extends Document {
  userId: mongoose.Types.ObjectId;
  businessName: string;
  tradeLicenseNumber: string;
  tinNumber?: string;
  nidPassportNumber: string;
  bankAccount: {
    bankName: string;
    branchName: string;
    routingNumber: string;
    accountHolderName: string;
    accountNumber: string;
  };
  mobileFinancialService?: {
    provider: 'bKash' | 'Nagad' | 'Rocket';
    accountNumber: string;
  };
  kycStatus: KYCStatus;
  rejectionReason?: string;
  commissionRateOverride?: number;
  approvedAt?: Date;
  approvedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const sellerSchema = new Schema<ISellerDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    businessName: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
    },
    tradeLicenseNumber: {
      type: String,
      required: [true, 'Trade license number is required'],
      trim: true,
    },
    tinNumber: {
      type: String,
      trim: true,
      default: null,
    },
    nidPassportNumber: {
      type: String,
      required: [true, 'NID or Passport number is required'],
      trim: true,
    },
    bankAccount: {
      bankName: { type: String, required: true },
      branchName: { type: String, required: true },
      routingNumber: { type: String, required: true },
      accountHolderName: { type: String, required: true },
      accountNumber: { type: String, required: true },
    },
    mobileFinancialService: {
      provider: { type: String, enum: ['bKash', 'Nagad', 'Rocket'] },
      accountNumber: { type: String },
    },
    kycStatus: {
      type: String,
      enum: ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'ACTION_REQUIRED'],
      default: 'PENDING',
      index: true,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    commissionRateOverride: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Seller: Model<ISellerDocument> =
  mongoose.models.Seller || mongoose.model<ISellerDocument>('Seller', sellerSchema);
