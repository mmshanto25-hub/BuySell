import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserAddressDocument extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'SHIPPING' | 'BILLING' | 'BOTH';
  recipientName: string;
  phone: string;
  streetAddress: string;
  city: string;
  division: string;
  postalCode: string;
  isDefault: boolean;
  deliveryNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userAddressSchema = new Schema<IUserAddressDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['SHIPPING', 'BILLING', 'BOTH'],
      default: 'SHIPPING',
    },
    recipientName: {
      type: String,
      required: [true, 'Recipient name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Contact phone is required'],
      trim: true,
    },
    streetAddress: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    division: {
      type: String,
      required: [true, 'Division is required'],
      trim: true,
    },
    postalCode: {
      type: String,
      required: [true, 'Postal code is required'],
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    deliveryNotes: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

userAddressSchema.index({ userId: 1, isDefault: -1 });

export const UserAddress: Model<IUserAddressDocument> =
  mongoose.models.UserAddress || mongoose.model<IUserAddressDocument>('UserAddress', userAddressSchema);
